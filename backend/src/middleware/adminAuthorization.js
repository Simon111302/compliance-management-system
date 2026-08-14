export function isAdminRole(role) {
  return typeof role === 'string' && role.trim().toLowerCase() === 'admin'
}

export function requireAdmin(request, response, next) {
  if (!isAdminRole(request.user?.role)) {
    response.status(403).json({ message: 'Administrator access required' })
    return
  }

  next()
}
