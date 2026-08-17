import { randomUUID } from 'node:crypto'
import type { ObjectId } from 'mongodb'

export const roleTypes = ['admin', 'reviewr', 'reporter'] as const
export type RoleType = (typeof roleTypes)[number]

export const userRoles = ['Admin', 'Reviewer', 'Reporter'] as const
export type UserRole = (typeof userRoles)[number]

export interface RoleDocument {
  _id: ObjectId
  roleId: string
  type: RoleType
  userId: string
  createdAt: Date
}

export function createRoleDocument(
  userId: string,
  type: RoleType,
  createdAt = new Date(),
  roleId = randomUUID(),
): Omit<RoleDocument, '_id'> {
  return { roleId, type, userId, createdAt }
}
