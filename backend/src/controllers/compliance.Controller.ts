import type { RequestHandler } from 'express'
import type { ComplianceInput } from '../models/compliance.Model.js'
import { recordActivity } from '../services/audit.Service.js'
import {
  createCompliance as createComplianceRecord,
  deleteCompliance as deleteComplianceRecord,
  getCompliance as getComplianceRecord,
  getEvidenceFile as getEvidenceFileRecord,
  listCompliances as listComplianceRecords,
  listReporters as listReporterRecords,
  reviewCompliance as reviewComplianceRecord,
  saveEvidence as saveEvidenceRecord,
  submitCompliance as submitComplianceRecord,
  updateCompliance as updateComplianceRecord,
  type UpdateComplianceInput,
} from '../services/compliance.Service.js'
import {
  isCompliancePriority,
  isComplianceStatus,
  validateComplianceSubmission,
} from '../utils/validators/compliance.validator.js'
import { validateReviewInput } from '../utils/validators/review.validator.js'

export const listCompliances: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const reporterId =
      request.user.role === 'Reporter' ? request.user.userId : undefined
    response.json(
      await listComplianceRecords(request.app.locals.database, reporterId),
    )
  } catch (error) {
    next(error)
  }
}

export const listReporters: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    response.json(await listReporterRecords(request.app.locals.database))
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
    await recordActivity(request.app.locals.database, request.user, {
      action: 'CREATE',
      entityType: 'Compliance',
      entityId: compliance.id,
      description: `Created compliance ${compliance.id}`,
      details: { complianceName: compliance.name },
    })
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

    await recordActivity(request.app.locals.database, request.user, {
      action: 'UPDATE',
      entityType: 'Compliance',
      entityId: compliance.id,
      description: `Updated compliance ${compliance.id}`,
      details: { updatedFields: Object.keys(input) },
    })
    response.json(compliance)
  } catch (error) {
    next(error)
  }
}

export const uploadEvidence: RequestHandler<{ id: string }> = async (
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
    if (compliance.reporterId !== request.user.userId) {
      response
        .status(403)
        .json({ message: 'Compliance is not assigned to you' })
      return
    }
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ message: 'Evidence file is required' })
      return
    }

    const encodedFilename = request.get('X-File-Name')
    const filename = encodedFilename
      ? decodeURIComponent(encodedFilename)
      : 'evidence-file'
    const saved = await saveEvidenceRecord(
      request.app.locals.database,
      request.params.id,
      {
        content: request.body,
        contentType: request.get('X-File-Type') || 'application/octet-stream',
        filename,
        uploadedBy: request.user.name,
        uploadedByEmail: request.user.email,
      },
    )
    if (saved) {
      await recordActivity(request.app.locals.database, request.user, {
        action: 'UPLOAD_EVIDENCE',
        entityType: 'Compliance',
        entityId: saved.id,
        description: `Uploaded evidence for compliance ${saved.id}`,
        details: { filename },
      })
    }
    response.json(saved ? { ...saved, reporter: request.user.name } : saved)
  } catch (error) {
    next(error)
  }
}

export const downloadEvidence: RequestHandler<{
  id: string
  fileId: string
}> = async (request, response, next) => {
  try {
    const compliance = await getComplianceRecord(
      request.app.locals.database,
      request.params.id,
    )
    if (!compliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }
    if (
      request.user.role === 'Reporter' &&
      compliance.reporterId !== request.user.userId
    ) {
      response
        .status(403)
        .json({ message: 'Compliance is not assigned to you' })
      return
    }

    const file = await getEvidenceFileRecord(
      request.app.locals.database,
      request.params.id,
      request.params.fileId,
    )
    if (!file) {
      response.status(404).json({ message: 'Evidence file not found' })
      return
    }

    const content = Buffer.isBuffer(file.content)
      ? file.content
      : file.content.buffer
    const filename = file.filename.replace(/["\r\n]/g, '_')
    response.setHeader('Content-Type', file.contentType)
    response.setHeader('Content-Length', String(content.length))
    response.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    await recordActivity(request.app.locals.database, request.user, {
      action: 'VIEW_EVIDENCE',
      entityType: 'ComplianceEvidence',
      entityId: request.params.fileId,
      description: `Viewed evidence for compliance ${compliance.id}`,
      details: { complianceId: compliance.id, filename: file.filename },
    })
    response.end(content)
  } catch (error) {
    next(error)
  }
}

export const submitCompliance: RequestHandler<{ id: string }> = async (
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
    if (compliance.reporterId !== request.user.userId) {
      response
        .status(403)
        .json({ message: 'Compliance is not assigned to you' })
      return
    }

    const validation = validateComplianceSubmission(
      compliance.type,
      request.body,
      compliance.evidence.length > 0,
    )
    if (!validation.valid) {
      response.status(400).json({ message: validation.errors.join('. ') })
      return
    }

    const saved = await submitComplianceRecord(
      request.app.locals.database,
      request.params.id,
      { ...validation.data },
    )
    if (saved) {
      await recordActivity(request.app.locals.database, request.user, {
        action: 'SUBMIT',
        entityType: 'Compliance',
        entityId: saved.id,
        description: `Submitted compliance ${saved.id}`,
      })
    }
    response.json(saved ? { ...saved, reporter: request.user.name } : saved)
  } catch (error) {
    next(error)
  }
}

export const reviewCompliance: RequestHandler<{ id: string }> = async (
  request,
  response,
  next,
) => {
  const { decision, comments } = request.body
  if (
    !validateReviewInput(decision) ||
    (comments !== undefined && typeof comments !== 'string')
  ) {
    response.status(400).json({ message: 'Invalid review data' })
    return
  }

  try {
    const existingCompliance = await getComplianceRecord(
      request.app.locals.database,
      request.params.id,
    )
    if (!existingCompliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }
    if (!existingCompliance.submission) {
      response
        .status(409)
        .json({ message: 'Compliance must be submitted before review' })
      return
    }
    if (existingCompliance.status !== 'Submitted') {
      response.status(409).json({ message: 'Compliance was already reviewed' })
      return
    }

    const reviewed = await reviewComplianceRecord(
      request.app.locals.database,
      request.params.id,
      decision,
      comments ?? '',
    )
    if (!reviewed) {
      response.status(409).json({ message: 'Compliance was already reviewed' })
      return
    }
    await recordActivity(request.app.locals.database, request.user, {
      action: 'REVIEW',
      entityType: 'Compliance',
      entityId: reviewed.id,
      description: `Reviewed compliance ${reviewed.id}: ${decision}`,
      details: { decision },
    })
    response.json(reviewed)
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

    await recordActivity(request.app.locals.database, request.user, {
      action: 'DELETE',
      entityType: 'Compliance',
      entityId: request.params.id,
      description: `Deleted compliance ${request.params.id}`,
    })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
