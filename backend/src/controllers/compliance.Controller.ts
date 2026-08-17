import type { RequestHandler } from 'express'
import type { ComplianceInput } from '../models/compliance.Model.js'
import {
  createCompliance as createComplianceRecord,
  deleteCompliance as deleteComplianceRecord,
  getCompliance as getComplianceRecord,
  listCompliances as listComplianceRecords,
  updateCompliance as updateComplianceRecord,
  type UpdateComplianceInput,
} from '../services/compliance.Service.js'
import {
  isCompliancePriority,
  isComplianceStatus,
} from '../utils/validators/compliance.validator.js'

export const listCompliances: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    response.json(await listComplianceRecords(request.app.locals.database))
  } catch (error) {
    next(error)
  }
}

export const getCompliance: RequestHandler<{ id: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const compliance = await getComplianceRecord(
      request.app.locals.database,
      request.params.id,
    )
    if (!compliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(compliance)
  } catch (error) {
    next(error)
  }
}

export const createCompliance: RequestHandler = async (
  request,
  response,
  next,
) => {
  const { id, name, type, reporterId, dueDate, priority, status, notes } =
    request.body
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof type !== 'string' ||
    typeof reporterId !== 'string' ||
    typeof dueDate !== 'string' ||
    !isCompliancePriority(priority) ||
    (status !== undefined && !isComplianceStatus(status)) ||
    (notes !== undefined && typeof notes !== 'string')
  ) {
    response.status(400).json({ message: 'Invalid compliance data' })
    return
  }

  const input: ComplianceInput = {
    id,
    name,
    type,
    reporterId,
    dueDate,
    priority,
    ...(status === undefined ? {} : { status }),
    ...(notes === undefined ? {} : { notes }),
  }

  try {
    const compliance = await createComplianceRecord(
      request.app.locals.database,
      input,
    )
    response.status(201).json(compliance)
  } catch (error) {
    next(error)
  }
}

export const updateCompliance: RequestHandler<{ id: string }> = async (
  request,
  response,
  next,
) => {
  const { name, type, reporterId, dueDate, priority, status, notes } =
    request.body
  if (
    (name !== undefined && typeof name !== 'string') ||
    (type !== undefined && typeof type !== 'string') ||
    (reporterId !== undefined && typeof reporterId !== 'string') ||
    (dueDate !== undefined && typeof dueDate !== 'string') ||
    (priority !== undefined && !isCompliancePriority(priority)) ||
    (status !== undefined && !isComplianceStatus(status)) ||
    (notes !== undefined && typeof notes !== 'string')
  ) {
    response.status(400).json({ message: 'Invalid compliance data' })
    return
  }

  const input: UpdateComplianceInput = {
    ...(name === undefined ? {} : { name }),
    ...(type === undefined ? {} : { type }),
    ...(reporterId === undefined ? {} : { reporterId }),
    ...(dueDate === undefined ? {} : { dueDate }),
    ...(priority === undefined ? {} : { priority }),
    ...(status === undefined ? {} : { status }),
    ...(notes === undefined ? {} : { notes }),
  }

  try {
    const compliance = await updateComplianceRecord(
      request.app.locals.database,
      request.params.id,
      input,
    )
    if (!compliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(compliance)
  } catch (error) {
    next(error)
  }
}

export const deleteCompliance: RequestHandler<{ id: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const deleted = await deleteComplianceRecord(
      request.app.locals.database,
      request.params.id,
    )
    if (!deleted) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
