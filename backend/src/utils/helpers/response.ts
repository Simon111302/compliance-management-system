import type { ValidationResult } from '../../types/validation.types.js'

export function validationResult<T>(
  errors: string[],
  data: T,
): ValidationResult<T> {
  return errors.length === 0
    ? { valid: true, errors: [], data }
    : { valid: false, errors }
}

export function validationMessage(
  validation: ValidationResult<unknown>,
): string {
  return validation.errors.join('; ')
}

export function serializeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}
