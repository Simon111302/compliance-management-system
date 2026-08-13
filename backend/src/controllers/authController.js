import {
  authenticateUser,
  clearSession,
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from '../services/authService.js'
import { validateLoginInput } from '../validators/requestValidators.js'

export async function login(request, response, next) {
  try {
    const email = request.body.email?.trim()
    const { password } = request.body

    if (!validateLoginInput(email, password)) {
      response.status(400).json({ message: 'Email and password are required' })
      return
    }

    const result = await authenticateUser(
      request.app.locals.database,
      email,
      password,
    )

    if (!result) {
      response.status(401).json({ message: 'Invalid email or password' })
      return
    }

    setSessionCookie(response, result.token)
    response.json(result.user)
  } catch (error) {
    next(error)
  }
}

export function currentUser(request, response) {
  response.json({
    email: request.user.email,
    name: request.user.name,
    role: request.user.role,
  })
}

export async function logout(request, response, next) {
  try {
    await clearSession(request.app.locals.database, readSessionToken(request))
    clearSessionCookie(response)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
