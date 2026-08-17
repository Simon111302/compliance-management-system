import { ObjectId, type Db } from 'mongodb'
import {
  createUserDocument,
  type UserDocument,
  type UserInput,
  type UserStatus,
} from '../models/user.Model.js'
import { normalizeEmail } from '../utils/helpers/normalizeEmail.js'

export interface CreateUserInput extends UserInput {
  passwordHash: string
  status?: UserStatus
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  passwordHash?: string
  status?: UserStatus
}

function users(database: Db) {
  return database.collection<UserDocument>('users')
}

export function listUsers(database: Db): Promise<UserDocument[]> {
  return users(database).find({}).sort({ createdAt: -1 }).toArray()
}

export function getUser(
  database: Db,
  userId: string,
): Promise<UserDocument | null> {
  return users(database).findOne({ userId })
}

export async function createUser(
  database: Db,
  input: CreateUserInput,
): Promise<UserDocument> {
  const document: UserDocument = {
    _id: new ObjectId(),
    ...createUserDocument(input, input.passwordHash, input.status),
  }

  await users(database).insertOne(document)
  return document
}

export async function updateUser(
  database: Db,
  userId: string,
  input: UpdateUserInput,
): Promise<UserDocument | null> {
  const existingUser = await getUser(database, userId)
  if (!existingUser) return null

  const firstName = input.firstName?.trim() ?? existingUser.firstName
  const lastName = input.lastName?.trim() ?? existingUser.lastName
  const document: UserDocument = {
    ...existingUser,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email:
      input.email === undefined
        ? existingUser.email
        : normalizeEmail(input.email),
    passwordHash: input.passwordHash ?? existingUser.passwordHash,
    status: input.status ?? existingUser.status,
  }

  await users(database).replaceOne({ userId }, document)
  return document
}

export async function deleteUser(
  database: Db,
  userId: string,
): Promise<boolean> {
  const result = await users(database).deleteOne({ userId })
  return result.deletedCount === 1
}
