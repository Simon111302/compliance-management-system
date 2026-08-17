import crypto from 'node:crypto'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

export function verifyPassword(
  password: string,
  storedPassword: unknown,
): boolean {
  if (typeof storedPassword !== 'string') return false

  const [salt, key, ...extra] = storedPassword.split(':')
  if (!salt || !key || extra.length > 0 || !/^[a-f\d]{128}$/i.test(key))
    return false

  const derivedKey = crypto.scryptSync(password, salt, 64)
  const storedKey = Buffer.from(key, 'hex')
  return (
    storedKey.length === derivedKey.length &&
    crypto.timingSafeEqual(storedKey, derivedKey)
  )
}

export function hashSession(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
