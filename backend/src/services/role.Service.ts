import { ObjectId, type Db } from 'mongodb'
import {
  createRoleDocument,
  type RoleDocument,
  type RoleType,
} from '../models/role.Model.js'

export interface CreateRoleInput {
  userId: string
  type: RoleType
}

export interface UpdateRoleInput {
  userId?: string
  type?: RoleType
}

function roles(database: Db) {
  return database.collection<RoleDocument>('roles')
}

export function listRoles(database: Db): Promise<RoleDocument[]> {
  return roles(database).find({}).sort({ createdAt: -1 }).toArray()
}

export function getRole(
  database: Db,
  roleId: string,
): Promise<RoleDocument | null> {
  return roles(database).findOne({ roleId })
}

export async function createRole(
  database: Db,
  input: CreateRoleInput,
): Promise<RoleDocument> {
  const document: RoleDocument = {
    _id: new ObjectId(),
    ...createRoleDocument(input.userId, input.type),
  }

  await roles(database).insertOne(document)
  return document
}

export async function updateRole(
  database: Db,
  roleId: string,
  input: UpdateRoleInput,
): Promise<RoleDocument | null> {
  const existingRole = await getRole(database, roleId)
  if (!existingRole) return null

  const document: RoleDocument = {
    ...existingRole,
    userId: input.userId ?? existingRole.userId,
    type: input.type ?? existingRole.type,
  }

  await roles(database).replaceOne({ roleId }, document)
  return document
}

export async function deleteRole(
  database: Db,
  roleId: string,
): Promise<boolean> {
  const result = await roles(database).deleteOne({ roleId })
  return result.deletedCount === 1
}
