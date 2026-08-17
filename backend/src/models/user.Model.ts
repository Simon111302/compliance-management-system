import { randomUUID } from 'node:crypto'
import type { ObjectId } from 'mongodb'
import { normalizeEmail } from '../utils/helpers/normalizeEmail.js'
import type { UserRole } from './role.Model.js'

export { userRoles } from './role.Model.js'
export const userStatuses = ['Active', 'Inactive'] as const
export type UserStatus = (typeof userStatuses)[number]

export interface UserDocument {
  _id: ObjectId
  userId: string
  firstName: string
  lastName: string
  name: string
  email: string
  passwordHash: string
  status: UserStatus
  createdAt: Date
}

export interface UserInput {
  firstName: string
  lastName: string
  email: string
}

export interface UserWithRole extends UserDocument {
  role: UserRole
}

export const activeUserFilter = { status: { $ne: 'Inactive' } } as const

export function createUserDocument(
  input: UserInput,
  passwordHash: string,
  status: UserStatus = 'Active',
  createdAt = new Date(),
  userId = randomUUID(),
): Omit<UserDocument, '_id'> {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  return {
    userId,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: normalizeEmail(input.email),
    passwordHash,
    status,
    createdAt,
  }
}
