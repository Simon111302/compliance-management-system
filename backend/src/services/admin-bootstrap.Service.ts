import type { Db } from 'mongodb'
import { adminEmail, adminName, adminPassword } from '../config/env.js'
import type { RoleDocument } from '../models/role.Model.js'
import type { UserDocument } from '../models/user.Model.js'
import { hashPassword } from '../utils/helpers/crypto.js'
import { normalizeEmail } from '../utils/helpers/normalizeEmail.js'
import { createRole } from './role.Service.js'
import { createUser } from './user.Service.js'

function splitName(name: string) {
  const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/)
  return { firstName, lastName: lastNameParts.join(' ') }
}

export async function ensureAdminUser(database: Db): Promise<void> {
  const email = normalizeEmail(adminEmail)
  const users = database.collection<UserDocument>('users')
  const existingUser = await users.findOne({ email })

  if (existingUser) {
    const role = await database
      .collection<RoleDocument>('roles')
      .findOne({ userId: existingUser.userId })
    if (!role) {
      await createRole(database, {
        userId: existingUser.userId,
        type: 'admin',
      })
    }
    return
  }

  const { firstName, lastName } = splitName(adminName)
  const user = await createUser(database, {
    firstName,
    lastName,
    email,
    passwordHash: hashPassword(adminPassword),
  })
  await createRole(database, { userId: user.userId, type: 'admin' })
}
