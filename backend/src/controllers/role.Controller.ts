import type { RequestHandler } from 'express'
import { recordActivity } from '../services/audit.Service.js'
import {
  createRole as createRoleRecord,
  deleteRole as deleteRoleRecord,
  getRole as getRoleRecord,
  listRoles as listRoleRecords,
  updateRole as updateRoleRecord,
} from '../services/role.Service.js'
import { isRoleType } from '../utils/validators/user.validator.js'

export const listRoles: RequestHandler = async (request, response, next) => {
  try {
    response.json(await listRoleRecords(request.app.locals.database))
  } catch (error) {
    next(error)
  }
}

export const getRole: RequestHandler<{ roleId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const role = await getRoleRecord(
      request.app.locals.database,
      request.params.roleId,
    )
    if (!role) {
      response.status(404).json({ message: 'Role not found' })
      return
    }

    response.json(role)
  } catch (error) {
    next(error)
  }
}

export const createRole: RequestHandler = async (request, response, next) => {
  const { userId, type } = request.body
  if (typeof userId !== 'string' || !isRoleType(type)) {
    response.status(400).json({ message: 'Invalid role data' })
    return
  }

  try {
    const role = await createRoleRecord(request.app.locals.database, {
      userId,
      type,
    })
    await recordActivity(request.app.locals.database, request.user, {
      action: 'CREATE',
      entityType: 'Role',
      entityId: role.roleId,
      description: `Assigned ${type} role to user ${userId}`,
      details: { roleType: type, userId },
    })
    response.status(201).json(role)
  } catch (error) {
    next(error)
  }
}

export const updateRole: RequestHandler<{ roleId: string }> = async (
  request,
  response,
  next,
) => {
  const { userId, type } = request.body
  if (
    (userId !== undefined && typeof userId !== 'string') ||
    (type !== undefined && !isRoleType(type))
  ) {
    response.status(400).json({ message: 'Invalid role data' })
    return
  }

  try {
    const role = await updateRoleRecord(
      request.app.locals.database,
      request.params.roleId,
      {
        ...(userId === undefined ? {} : { userId }),
        ...(type === undefined ? {} : { type }),
      },
    )
    if (!role) {
      response.status(404).json({ message: 'Role not found' })
      return
    }

    await recordActivity(request.app.locals.database, request.user, {
      action: 'UPDATE',
      entityType: 'Role',
      entityId: role.roleId,
      description: `Updated role ${role.roleId}`,
      details: { roleType: role.type, userId: role.userId },
    })
    response.json(role)
  } catch (error) {
    next(error)
  }
}

export const deleteRole: RequestHandler<{ roleId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const deleted = await deleteRoleRecord(
      request.app.locals.database,
      request.params.roleId,
    )
    if (!deleted) {
      response.status(404).json({ message: 'Role not found' })
      return
    }

    await recordActivity(request.app.locals.database, request.user, {
      action: 'DELETE',
      entityType: 'Role',
      entityId: request.params.roleId,
      description: `Deleted role ${request.params.roleId}`,
    })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
