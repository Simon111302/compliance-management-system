import type { UserRole, UserStatus } from './common.types.js'

export interface AuthUser {
  id?: string
  _id?: string
  name: string
  email: string
  role: UserRole
  status?: UserStatus
  firstName?: string
  lastName?: string
}

export interface User extends AuthUser {
  firstName: string
  lastName: string
}

export interface UserForm {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'Reviewer' | 'Reporter'
  status: UserStatus
}
