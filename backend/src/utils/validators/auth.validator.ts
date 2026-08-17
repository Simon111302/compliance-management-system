export function validateLoginInput(
  email: unknown,
  password: unknown,
): email is string {
  return (
    typeof email === 'string' &&
    email.trim().length > 0 &&
    typeof password === 'string' &&
    password.length > 0
  )
}
