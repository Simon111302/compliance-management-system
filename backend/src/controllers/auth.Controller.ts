import type { RequestHandler } from 'express'
import {
  authenticateCredentials,
  clearSessionCookie,
  deleteSession,
  readSessionToken,
  setSessionCookie,
} from '../services/session.Service.js'
import { validateLoginInput } from '../utils/validators/auth.validator.js'

export const login: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as {
      email?: unknown
      password?: unknown
    }
    if (
      !validateLoginInput(email, password) ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      response.status(400).json({ message: 'Email and password are required' })
      return
    }

    const result = await authenticateCredentials(
      request.app.locals.database,
      email,
      password,
    )
    if (!result) {
      response.status(401).json({ message: 'Invalid email or password' })
      return
    }

    setSessionCookie(response, result.token)
    response.json({
      id: result.user.userId,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      status: result.user.status,
    })
  } catch (error) {
    next(error)
  }
}

export const currentUser: RequestHandler = (request, response) => {
  response.json({
    id: request.user.userId,
    name: request.user.name,
    email: request.user.email,
    role: request.user.role,
    status: request.user.status,
  })
}

export const logout: RequestHandler = async (request, response, next) => {
  try {
    await deleteSession(request.app.locals.database, readSessionToken(request))
    clearSessionCookie(response)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
