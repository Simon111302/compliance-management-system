import { adminEmail, adminName, adminPassword } from '../config/env.js'
import { hashPassword } from '../utils/crypto.js'

function splitName(name) {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export async function ensureAdminUser(database) {
  const email = adminEmail.trim().toLowerCase()
  const users = database.collection('users')

  if (await users.findOne({ email })) return false

  const { firstName, lastName } = splitName(adminName)
  await users.insertOne({
    firstName,
    lastName,
    name: adminName.trim(),
    email,
    passwordHash: hashPassword(adminPassword),
    status: 'Active',
    role: 'Admin',
    createdAt: new Date(),
  })

  return true
}
