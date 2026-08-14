export const userRoles = ['Admin', 'Reviewer', 'Reporter']
export const activeUserFilter = { status: { $ne: 'Inactive' } }

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function createUserDocument(
  input,
  passwordHash,
  status = 'Active',
  createdAt = new Date(),
) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: normalizeEmail(input.email),
    passwordHash,
    status,
    role: input.role,
    createdAt,
  }
}

export function updateUserDocument(input, existingUser) {
  return createUserDocument(
    input,
    existingUser.passwordHash,
    existingUser.status ?? 'Active',
    existingUser.createdAt ?? new Date(),
  )
}

export function serializeUser(user) {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

export function serializeAuthenticatedUser(user) {
  return { email: user.email, name: user.name, role: user.role }
}

export function createAdminDocument(input, passwordHash) {
  return createUserDocument(
    {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: 'Admin',
    },
    passwordHash,
  )
}
