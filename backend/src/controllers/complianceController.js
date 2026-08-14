import { ObjectId } from 'mongodb'
import { logAuditEvent } from '../services/auditService.js'
import {
  validateComplianceSubmission,
  validateReviewInput,
} from '../validators/requestValidators.js'

function collection(request) {
  return request.app.locals.database.collection('compliances')
}

function withoutMongoId(document) {
  const { _id, ...compliance } = document
  return compliance
}

function dueBeforeToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function statusForDueDate(status, dueDate) {
  if (['Approved', 'Rejected'].includes(status)) return status
  return dueDate < dueBeforeToday() ? 'Overdue' : status
}

async function updateOverdueCompliances(request) {
  await collection(request).updateMany(
    {
      dueDate: { $lt: dueBeforeToday() },
      status: { $nin: ['Approved', 'Rejected', 'Overdue'] },
    },
    { $set: { status: 'Overdue' } },
  )
}

async function auditCompliance(request, action, entityId, description) {
  await logAuditEvent(request.app.locals.database, {
    action,
    entityType: 'Compliance',
    entityId,
    details: { description },
    performedBy: request.user._id,
    performedByEmail: request.user.email,
  })
}

function assignedReporterFilter(request) {
  return {
    $or: [
      { reporterId: request.user._id.toString() },
      {
        reporterId: { $exists: false },
        reporterEmail: request.user.email,
      },
      {
        reporterId: { $exists: false },
        reporterEmail: { $exists: false },
        reporter: request.user.name,
      },
    ],
  }
}

export async function listCompliances(request, response, next) {
  try {
    await updateOverdueCompliances(request)

    const filter =
      request.user.role === 'Reporter' ? assignedReporterFilter(request) : {}
    const compliances = await collection(request)
      .find(filter)
      .sort({ id: 1 })
      .toArray()
    response.json(compliances.map(withoutMongoId))
  } catch (error) {
    next(error)
  }
}

export async function listReporters(request, response, next) {
  try {
    const reporters = await request.app.locals.database
      .collection('users')
      .find({ role: 'Reporter', status: { $ne: 'Inactive' } })
      .project({ firstName: 1, lastName: 1, name: 1, email: 1 })
      .sort({ firstName: 1, lastName: 1 })
      .toArray()

    response.json(
      reporters.map((reporter) => ({
        id: reporter._id.toString(),
        email: reporter.email,
        name:
          reporter.name ||
          `${reporter.firstName ?? ''} ${reporter.lastName ?? ''}`.trim() ||
          reporter.email,
      })),
    )
  } catch (error) {
    next(error)
  }
}

async function reporterAssignment(request, input) {
  if (!ObjectId.isValid(input.reporterId)) return null

  const reporter = await request.app.locals.database
    .collection('users')
    .findOne({
      _id: ObjectId.createFromHexString(input.reporterId),
      role: 'Reporter',
      status: { $ne: 'Inactive' },
    })
  if (!reporter) return null

  return {
    reporterId: reporter._id.toString(),
    reporterEmail: reporter.email,
    reporter: reporter.name,
  }
}

export async function createCompliance(request, response, next) {
  try {
    const assignment = await reporterAssignment(request, request.body)
    if (!assignment) {
      response.status(400).json({ message: 'Select an active reporter' })
      return
    }

    const compliance = {
      ...request.body,
      ...assignment,
      status: statusForDueDate('Pending', request.body.dueDate),
      submission: null,
    }
    await collection(request).insertOne(compliance)
    await auditCompliance(
      request,
      'CREATE',
      compliance.id,
      `Created compliance ${compliance.id ?? ''}`.trim(),
    )
    response.status(201).json(compliance)
  } catch (error) {
    next(error)
  }
}

export async function replaceCompliance(request, response, next) {
  try {
    const assignment = await reporterAssignment(request, request.body)
    if (!assignment) {
      response.status(400).json({ message: 'Select an active reporter' })
      return
    }

    const existingCompliance = await collection(request).findOne({
      id: request.params.id,
    })
    if (!existingCompliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    const compliance = {
      ...request.body,
      ...assignment,
      id: request.params.id,
      status: statusForDueDate(existingCompliance.status, request.body.dueDate),
      submission: existingCompliance.submission ?? null,
      reviewerComments: existingCompliance.reviewerComments ?? '',
    }
    await collection(request).replaceOne({ id: request.params.id }, compliance)

    await auditCompliance(
      request,
      'UPDATE',
      request.params.id,
      `Updated compliance ${request.params.id}`,
    )
    response.json(compliance)
  } catch (error) {
    next(error)
  }
}

export async function submitComplianceForm(request, response, next) {
  try {
    const reporterFilter = {
      id: request.params.id,
      ...assignedReporterFilter(request),
    }
    const compliance = await collection(request).findOne(reporterFilter)
    if (!compliance) {
      response.status(404).json({ message: 'Assigned compliance not found' })
      return
    }

    const validation = validateComplianceSubmission(
      compliance.type,
      request.body,
    )
    if (!validation.valid) {
      response.status(400).json({ message: validation.errors.join('; ') })
      return
    }

    const submission = {
      type: compliance.type,
      ...validation.data,
      submittedAt: new Date(),
      submittedBy: request.user._id,
      submittedByEmail: request.user.email,
    }
    const status = statusForDueDate('Pending Evidence', compliance.dueDate)
    const result = await collection(request).findOneAndUpdate(
      reporterFilter,
      { $set: { submission, status } },
      { returnDocument: 'after' },
    )
    if (!result) {
      response.status(404).json({ message: 'Assigned compliance not found' })
      return
    }

    await auditCompliance(
      request,
      'SUBMIT',
      request.params.id,
      `Submitted ${compliance.type} form for compliance ${request.params.id}`,
    )
    response.json(withoutMongoId(result))
  } catch (error) {
    next(error)
  }
}

export async function reviewCompliance(request, response, next) {
  try {
    const { decision } = request.body

    if (!validateReviewInput(decision)) {
      response.status(400).json({ message: 'Invalid review decision' })
      return
    }

    const statuses = {
      Approve: 'Approved',
      Partial: 'Partial',
      Reject: 'Rejected',
    }
    const existingCompliance = await collection(request).findOne({
      id: request.params.id,
    })
    if (!existingCompliance) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    const result = await collection(request).findOneAndUpdate(
      { id: request.params.id },
      {
        $set: {
          status: statusForDueDate(
            statuses[decision],
            existingCompliance.dueDate,
          ),
          reviewerComments: request.body.comments?.trim() ?? '',
        },
      },
      { returnDocument: 'after' },
    )

    if (!result) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    await auditCompliance(
      request,
      'REVIEW',
      request.params.id,
      `${decision} review for compliance ${request.params.id}`,
    )
    response.json(withoutMongoId(result))
  } catch (error) {
    next(error)
  }
}
