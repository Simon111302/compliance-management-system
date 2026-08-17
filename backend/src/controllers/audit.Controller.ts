import type { RequestHandler } from 'express'
import {
  createAudit as createAuditRecord,
  deleteAudit as deleteAuditRecord,
  getAudit as getAuditRecord,
  listAudits as listAuditRecords,
  updateAudit as updateAuditRecord,
  type UpdateAuditInput,
} from '../services/audit.Service.js'
import {
  isAuditAction,
  isAuditDetails,
} from '../utils/validators/review.validator.js'

export const listAudits: RequestHandler = async (request, response, next) => {
  try {
    response.json(await listAuditRecords(request.app.locals.database))
  } catch (error) {
    next(error)
  }
}

export const getAudit: RequestHandler<{ auditId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const audit = await getAuditRecord(
      request.app.locals.database,
      request.params.auditId,
    )
    if (!audit) {
      response.status(404).json({ message: 'Audit not found' })
      return
    }

    response.json(audit)
  } catch (error) {
    next(error)
  }
}

export const createAudit: RequestHandler = async (request, response, next) => {
  const { action, details, entityType, entityId, performedBy } = request.body
  if (
    !isAuditAction(action) ||
    !isAuditDetails(details) ||
    typeof entityType !== 'string' ||
    typeof entityId !== 'string' ||
    typeof performedBy !== 'string'
  ) {
    response.status(400).json({ message: 'Invalid audit data' })
    return
  }

  try {
    const audit = await createAuditRecord(request.app.locals.database, {
      action,
      ...(details === undefined ? {} : { details }),
      entityType,
      entityId,
      performedBy,
    })
    response.status(201).json(audit)
  } catch (error) {
    next(error)
  }
}

export const updateAudit: RequestHandler<{ auditId: string }> = async (
  request,
  response,
  next,
) => {
  const { action, details, entityType, entityId, performedBy } = request.body
  if (
    (action !== undefined && !isAuditAction(action)) ||
    !isAuditDetails(details) ||
    (entityType !== undefined && typeof entityType !== 'string') ||
    (entityId !== undefined && typeof entityId !== 'string') ||
    (performedBy !== undefined && typeof performedBy !== 'string')
  ) {
    response.status(400).json({ message: 'Invalid audit data' })
    return
  }

  const input: UpdateAuditInput = {
    ...(action === undefined ? {} : { action }),
    ...(details === undefined ? {} : { details }),
    ...(entityType === undefined ? {} : { entityType }),
    ...(entityId === undefined ? {} : { entityId }),
    ...(performedBy === undefined ? {} : { performedBy }),
  }

  try {
    const audit = await updateAuditRecord(
      request.app.locals.database,
      request.params.auditId,
      input,
    )
    if (!audit) {
      response.status(404).json({ message: 'Audit not found' })
      return
    }

    response.json(audit)
  } catch (error) {
    next(error)
  }
}

export const deleteAudit: RequestHandler<{ auditId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const deleted = await deleteAuditRecord(
      request.app.locals.database,
      request.params.auditId,
    )
    if (!deleted) {
      response.status(404).json({ message: 'Audit not found' })
      return
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
