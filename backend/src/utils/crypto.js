import crypto from 'node:crypto'

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

export function verifyPassword(password, storedPassword) {
  const [salt, key] = storedPassword.split(':')
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(
    Buffer.from(key, 'hex'),
    Buffer.from(derivedKey, 'hex'),
  )
}

export function hashSession(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}
