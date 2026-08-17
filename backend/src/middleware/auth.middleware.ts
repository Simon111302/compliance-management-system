import type { RequestHandler } from 'express'
import {
  getSessionUser,
  readSessionToken,
} from '../services/session.Service.js'

export const authenticate: RequestHandler = async (request, response, next) => {
  try {
    const token = readSessionToken(request)
    if (!token) {
      response.status(401).json({ message: 'Authentication required' })
      return
    }

    const user = await getSessionUser(request.app.locals.database, token)
    if (!user) {
      response.status(401).json({ message: 'Session expired or invalid' })
      return
    }

    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const requireAuthenticated: RequestHandler = (
  request,
  response,
  next,
) => {
  if (!request.user) {
    response.status(401).json({ message: 'Authentication required' })
    return
  }

  next()
}
