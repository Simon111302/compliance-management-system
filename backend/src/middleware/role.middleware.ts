import type { RequestHandler } from 'express'
import type { UserRole } from '../models/role.Model.js'

export function requireRoles(...roles: UserRole[]): RequestHandler {
  return function authorizeRole(request, response, next) {
    if (!request.user || !roles.includes(request.user.role)) {
      response.status(403).json({ message: 'Access denied for this role' })
      return
    }

    next()
  }
}
