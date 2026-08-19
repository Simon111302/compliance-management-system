import type { Request, Response } from 'express'
import { ObjectId, type Db } from 'mongodb'
import { frontendOrigin } from '../config/env.js'
import type { RoleDocument, UserRole } from '../models/role.Model.js'
import { activeUserFilter, type UserDocument } from '../models/user.Model.js'
import type { SessionDocument } from '../types/auth.types.js'
import type { AuthenticatedUser } from '../types/user.types.js'
import {
  createSessionToken,
  hashSession,
  verifyPassword,
} from '../utils/helpers/crypto.js'
import { normalizeEmail } from '../utils/helpers/normalizeEmail.js'

const cookieName = 'compliance_session'
const sessionDays = 7
const sessionMaxAge = sessionDays * 24 * 60 * 60
const sessionCookieSecurity = frontendOrigin.startsWith('https://')
  ? 'SameSite=None; Secure'
  : 'SameSite=Lax'

function resolveRole(type: RoleDocument['type']): UserRole {
  if (type === 'admin') return 'Admin'
  if (type === 'reviewr') return 'Reviewer'
  return 'Reporter'
}

async function attachRole(
  database: Db,
  user: UserDocument,
): Promise<AuthenticatedUser | null> {
  const role = await database
    .collection<RoleDocument>('roles')
    .findOne({ userId: user.userId })
  return role ? { ...user, role: resolveRole(role.type) } : null
}

export function readSessionToken(request: Request): string | undefined {
  const cookies =
    request.headers.cookie?.split(';').map((cookie) => cookie.trim()) ?? []
  const session = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`))
  return session?.slice(cookieName.length + 1)
}

export async function authenticateCredentials(
  database: Db,
  email: string,
  password: string,
): Promise<{ token: string; user: AuthenticatedUser } | null> {
  const user = await database.collection<UserDocument>('users').findOne({
    email: normalizeEmail(email),
    ...activeUserFilter,
  })
  if (!user || !verifyPassword(password, user.passwordHash)) return null

  const authenticatedUser = await attachRole(database, user)
  if (!authenticatedUser) return null

  const token = createSessionToken()
  await database.collection<SessionDocument>('sessions').insertOne({
    _id: new ObjectId(),
    userId: user._id,
    tokenHash: hashSession(token),
    expiresAt: new Date(Date.now() + sessionMaxAge * 1000),
  })

  return { token, user: authenticatedUser }
}

export async function getSessionUser(
  database: Db,
  token: string,
): Promise<AuthenticatedUser | null> {
  const sessions = database.collection<SessionDocument>('sessions')
  const session = await sessions.findOne({
    tokenHash: hashSession(token),
    expiresAt: { $gt: new Date() },
  })
  if (!session) return null

  const user = await database.collection<UserDocument>('users').findOne({
    _id: session.userId,
    ...activeUserFilter,
  })
  if (!user) {
    await sessions.deleteOne({ _id: session._id })
    return null
  }

  return attachRole(database, user)
}

export async function deleteSession(
  database: Db,
  token: string | undefined,
): Promise<void> {
  if (!token) return
  await database
    .collection<SessionDocument>('sessions')
    .deleteOne({ tokenHash: hashSession(token) })
}

export function setSessionCookie(response: Response, token: string): void {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=${token}; HttpOnly; Path=/; ${sessionCookieSecurity}; Max-Age=${sessionMaxAge}`,
  )
}

export function clearSessionCookie(response: Response): void {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=; HttpOnly; Path=/; ${sessionCookieSecurity}; Max-Age=0`,
  )
}
