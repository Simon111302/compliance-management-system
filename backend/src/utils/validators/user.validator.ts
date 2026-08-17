import type { CreateUserInput, UserInput } from '../../types/user.types.js'
import type { ValidationResult } from '../../types/validation.types.js'
import { userRoles, roleTypes, type RoleType } from '../../models/role.Model.js'
import { userStatuses, type UserStatus } from '../../models/user.Model.js'
import { validationResult } from '../helpers/response.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateString(
  value: unknown,
  field: string,
  errors: string[],
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} is required`)
    return ''
  }
  return value
}

function validateUserFields(
  input: unknown,
  requirePassword: true,
): ValidationResult<CreateUserInput>
function validateUserFields(
  input: unknown,
  requirePassword: false,
): ValidationResult<UserInput>
function validateUserFields(
  input: unknown,
  requirePassword: boolean,
): ValidationResult<UserInput | CreateUserInput> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Request body must be an object'] }
  }
  const value = input as Record<string, unknown>
  const errors: string[] = []
  const firstName = validateString(value.firstName, 'firstName', errors)
  const lastName = validateString(value.lastName, 'lastName', errors)
  const email = validateString(value.email, 'email', errors)
  if (email && !emailPattern.test(email.trim())) {
    errors.push('email must be a valid email address')
  }
  const password = requirePassword
    ? validateString(value.password, 'password', errors)
    : undefined
  const role = userRoles.find((candidate) => candidate === value.role)
  if (!role) errors.push(`role must be one of: ${userRoles.join(', ')}`)

  const data: UserInput | CreateUserInput = {
    firstName,
    lastName,
    email,
    role: role ?? 'Reporter',
    ...(password !== undefined ? { password } : {}),
  }
  return validationResult(errors, data)
}

export function validateCreateUser(
  input: unknown,
): ValidationResult<CreateUserInput> {
  return validateUserFields(input, true)
}

export function validateUpdateUser(
  input: unknown,
): ValidationResult<UserInput> {
  return validateUserFields(input, false)
}

export function validateResetPassword(
  input: unknown,
): ValidationResult<{ password: string }> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Request body must be an object'] }
  }
  const errors: string[] = []
  const password = validateString(
    (input as Record<string, unknown>).password,
    'password',
    errors,
  )
  return validationResult(errors, { password })
}

export function isUserStatus(value: unknown): value is UserStatus {
  return userStatuses.some((status) => status === value)
}

export function isRoleType(value: unknown): value is RoleType {
  return roleTypes.some((type) => type === value)
}
