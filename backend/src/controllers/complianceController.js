import { GridFSBucket, ObjectId } from 'mongodb'
import { logAuditEvent } from '../services/auditService.js'
import {
  createEvidenceFileMetadata,
  evidenceMaxBytes,
  isEvidenceMimeType,
} from '../models/evidenceModel.js'
import {
  validateComplianceSubmission,
  validateReviewInput,
} from '../validators/requestValidators.js'

function collection(request) {
  return request.app.locals.database.collection('compliances')
}

function evidenceBucket(request) {
  return new GridFSBucket(request.app.locals.database, {
    bucketName: 'evidenceFiles',
  })
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

function evidenceAccessFilter(request) {
  return request.user.role === 'Reporter' ? assignedReporterFilter(request) : {}
}

function safeFilename(value) {
  return value.replace(/[\r\n"\\/]/g, '_')
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
      evidenceFile: existingCompliance.evidenceFile ?? null,
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

export async function uploadComplianceEvidence(request, response, next) {
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

    const contentType = request.get('x-file-type')
    const encodedFilename = request.get('x-file-name')
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ message: 'Select an evidence file' })
      return
    }
    if (request.body.length > evidenceMaxBytes) {
      response
        .status(413)
        .json({ message: 'Evidence file must be 10 MB or less' })
      return
    }
    if (!isEvidenceMimeType(contentType)) {
      response.status(400).json({
        message: 'Evidence must be a PDF, JPG, PNG, WebP, or text file',
      })
      return
    }

    let filename
    try {
      filename = safeFilename(decodeURIComponent(encodedFilename ?? ''))
    } catch {
      filename = ''
    }
    if (!filename) {
      response.status(400).json({ message: 'Evidence filename is required' })
      return
    }

    const bucket = evidenceBucket(request)
    const upload = bucket.openUploadStream(filename, {
      metadata: {
        complianceId: compliance.id,
        contentType,
        uploadedBy: request.user._id,
      },
    })
    await new Promise((resolve, reject) => {
      upload.on('finish', resolve)
      upload.on('error', reject)
      upload.end(request.body)
    })

    const file = createEvidenceFileMetadata({
      fileId: upload.id,
      filename,
      contentType,
      size: request.body.length,
      uploadedBy: request.user._id,
      uploadedByEmail: request.user.email,
    })
    await collection(request).updateOne(reporterFilter, {
      $set: { evidenceFile: file },
    })

    const previousFileId = compliance.evidenceFile?.fileId
    if (previousFileId && !previousFileId.equals?.(upload.id)) {
      await bucket.delete(previousFileId).catch(() => undefined)
    }

    await auditCompliance(
      request,
      'UPLOAD_EVIDENCE',
      request.params.id,
      `Uploaded evidence ${filename} for compliance ${request.params.id}`,
    )
    response.status(201).json(file)
  } catch (error) {
    next(error)
  }
}

export async function downloadComplianceEvidence(request, response, next) {
  try {
    if (!ObjectId.isValid(request.params.fileId)) {
      response.status(400).json({ message: 'Invalid evidence file id' })
      return
    }

    const fileId = ObjectId.createFromHexString(request.params.fileId)
    const compliance = await collection(request).findOne({
      id: request.params.id,
      ...evidenceAccessFilter(request),
      $and: [
        {
          $or: [
            { 'evidenceFile.fileId': fileId },
            { 'submission.evidence.file.fileId': fileId },
          ],
        },
      ],
    })
    if (!compliance) {
      response.status(404).json({ message: 'Evidence not found' })
      return
    }

    const bucket = evidenceBucket(request)
    const storedFile = await bucket.find({ _id: fileId }).next()
    if (!storedFile) {
      response.status(404).json({ message: 'Evidence not found' })
      return
    }

    const contentType = storedFile.metadata?.contentType
    response.setHeader(
      'Content-Type',
      contentType || 'application/octet-stream',
    )
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${safeFilename(storedFile.filename)}"`,
    )
    bucket.openDownloadStream(fileId).on('error', next).pipe(response)
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

    const existingEvidenceFile =
      compliance.evidenceFile ?? compliance.submission?.evidence?.file ?? null
    const validation = validateComplianceSubmission(
      compliance.type,
      request.body,
      Boolean(existingEvidenceFile),
    )
    if (!validation.valid) {
      response.status(400).json({ message: validation.errors.join('; ') })
      return
    }

    const submission = {
      type: compliance.type,
      ...validation.data,
      evidence: {
        ...validation.data.evidence,
        file: existingEvidenceFile,
      },
      submittedAt: new Date(),
      submittedBy: request.user._id,
      submittedByEmail: request.user.email,
    }
    const status = statusForDueDate('Pending Evidence', compliance.dueDate)
    const priorSubmittedFileId =
      compliance.submission?.evidence?.file?.fileId ?? null
    const result = await collection(request).findOneAndUpdate(
      reporterFilter,
      { $set: { submission, status }, $unset: { evidenceFile: '' } },
      { returnDocument: 'after' },
    )
    if (!result) {
      response.status(404).json({ message: 'Assigned compliance not found' })
      return
    }

    const submittedFileId = submission.evidence.file?.fileId
    if (
      priorSubmittedFileId &&
      submittedFileId &&
      !priorSubmittedFileId.equals?.(submittedFileId)
    ) {
      await evidenceBucket(request)
        .delete(priorSubmittedFileId)
        .catch(() => undefined)
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
