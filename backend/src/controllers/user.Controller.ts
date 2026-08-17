import type { RequestHandler } from 'express'
import {
  createUser as createUserRecord,
  deleteUser as deleteUserRecord,
  getUser as getUserRecord,
  listUsers as listUserRecords,
  updateUser as updateUserRecord,
  type UpdateUserInput,
} from '../services/user.Service.js'
import { hashPassword } from '../utils/helpers/crypto.js'
import { serializeUser } from '../utils/helpers/response.js'
import { isUserStatus } from '../utils/validators/user.validator.js'

export const listUsers: RequestHandler = async (request, response, next) => {
  try {
    const users = await listUserRecords(request.app.locals.database)
    response.json(users.map(serializeUser))
  } catch (error) {
    next(error)
  }
}

export const getUser: RequestHandler<{ userId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const user = await getUserRecord(
      request.app.locals.database,
      request.params.userId,
    )
    if (!user) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    response.json(serializeUser(user))
  } catch (error) {
    next(error)
  }
}

export const createUser: RequestHandler = async (request, response, next) => {
  const { firstName, lastName, email, password, status } = request.body
  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    (status !== undefined && !isUserStatus(status))
  ) {
    response.status(400).json({ message: 'Invalid user data' })
    return
  }

  try {
    const user = await createUserRecord(request.app.locals.database, {
      firstName,
      lastName,
      email,
      passwordHash: hashPassword(password),
      ...(status === undefined ? {} : { status }),
    })
    response.status(201).json(serializeUser(user))
  } catch (error) {
    next(error)
  }
}

export const updateUser: RequestHandler<{ userId: string }> = async (
  request,
  response,
  next,
) => {
  const { firstName, lastName, email, password, status } = request.body
  if (
    (firstName !== undefined && typeof firstName !== 'string') ||
    (lastName !== undefined && typeof lastName !== 'string') ||
    (email !== undefined && typeof email !== 'string') ||
    (password !== undefined && typeof password !== 'string') ||
    (status !== undefined && !isUserStatus(status))
  ) {
    response.status(400).json({ message: 'Invalid user data' })
    return
  }

  const input: UpdateUserInput = {
    ...(firstName === undefined ? {} : { firstName }),
    ...(lastName === undefined ? {} : { lastName }),
    ...(email === undefined ? {} : { email }),
    ...(password === undefined ? {} : { passwordHash: hashPassword(password) }),
    ...(status === undefined ? {} : { status }),
  }

  try {
    const user = await updateUserRecord(
      request.app.locals.database,
      request.params.userId,
      input,
    )
    if (!user) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    response.json(serializeUser(user))
  } catch (error) {
    next(error)
  }
}

export const deleteUser: RequestHandler<{ userId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const deleted = await deleteUserRecord(
      request.app.locals.database,
      request.params.userId,
    )
    if (!deleted) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
