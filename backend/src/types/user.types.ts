import type { Document } from 'mongodb'
import type { UserRole } from '../models/role.Model.js'
import type { UserDocument as UserModel } from '../models/user.Model.js'

export type UserStatus = 'Active' | 'Inactive'

export interface UserDocument extends UserModel, Document {
  roleId?: string
  role?: UserRole
}

export interface AuthenticatedUser extends UserDocument {
  role: UserRole
}

export interface UserInput {
  firstName: string
  lastName: string
  email: string
  password?: string
  role: UserRole
  status?: UserStatus
}

export type CreateUserInput = UserInput & { password: string }
