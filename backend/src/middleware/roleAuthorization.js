export function requireRoles(...roles) {
  return function authorizeRole(request, response, next) {
    if (!roles.includes(request.user?.role)) {
      response.status(403).json({ message: 'Access denied for this role' })
      return
    }

    next()
  }
}
