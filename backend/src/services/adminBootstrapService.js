import { adminEmail, adminName, adminPassword } from '../config/env.js'
import { createAdminDocument, normalizeEmail } from '../models/userModel.js'
import { hashPassword } from '../utils/crypto.js'

function splitName(name) {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export async function ensureAdminUser(database) {
  const email = normalizeEmail(adminEmail)
  const users = database.collection('users')

  if (await users.findOne({ email })) return false

  const { firstName, lastName } = splitName(adminName)
  await users.insertOne(
    createAdminDocument(
      { email, firstName, lastName },
      hashPassword(adminPassword),
    ),
  )

  return true
}
