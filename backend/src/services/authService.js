import {
  createSessionToken,
  hashPassword,
  hashSession,
  verifyPassword,
} from '../utils/crypto.js'

const cookieName = 'compliance_session'
const sessionDays = 7

export async function seedReviewer(database) {
  const email = process.env.REVIEWER_EMAIL
  const password = process.env.REVIEWER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'REVIEWER_EMAIL and REVIEWER_PASSWORD must be defined in .env',
    )
  }

  const users = database.collection('users')
  await users.createIndex({ email: 1 }, { unique: true })
  const existing = await users.findOne({ email })

  if (!existing) {
    await users.insertOne({
      email,
      name: process.env.REVIEWER_NAME ?? 'Alex Rivera',
      passwordHash: hashPassword(password),
      role: 'Reviewer',
    })
  }
}

export function readSessionToken(request) {
  const cookies =
    request.headers.cookie?.split(';').map((cookie) => cookie.trim()) ?? []
  const session = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`))
  return session?.slice(cookieName.length + 1)
}

export async function authenticate(request, response, next) {
  const token = readSessionToken(request)
  const database = request.app.locals.database

  if (!token) {
    response.status(401).json({ message: 'Authentication required' })
    return
  }

  const session = await database.collection('sessions').findOne({
    tokenHash: hashSession(token),
    expiresAt: { $gt: new Date() },
  })

  if (!session) {
    response.status(401).json({ message: 'Session expired' })
    return
  }

  request.user = await database
    .collection('users')
    .findOne({ _id: session.userId })
  next()
}

export async function authenticateUser(database, email, password) {
  const user = await database.collection('users').findOne({ email })

  if (!user || !verifyPassword(password, user.passwordHash)) return null

  const token = createSessionToken()
  await database.collection('sessions').insertOne({
    userId: user._id,
    tokenHash: hashSession(token),
    expiresAt: new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000),
  })

  return {
    token,
    user: { email: user.email, name: user.name, role: user.role },
  }
}

export async function clearSession(database, token) {
  if (token) {
    await database
      .collection('sessions')
      .deleteOne({ tokenHash: hashSession(token) })
  }
}

export function setSessionCookie(response, token) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionDays * 24 * 60 * 60}`,
  )
}

export function clearSessionCookie(response) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  )
}
