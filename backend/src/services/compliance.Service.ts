import { ObjectId, type Db, type Filter } from 'mongodb'
import {
  createComplianceDocument,
  type ComplianceDocument,
  type ComplianceInput,
  type ComplianceSubmission,
  type EvidenceFileDocument,
  type EvidenceFileMetadata,
} from '../models/compliance.Model.js'
import type { ReviewDecision } from '../types/reviewer-action.types.js'
import type { UserDocument } from '../models/user.Model.js'

export type UpdateComplianceInput = Partial<
  Omit<ComplianceDocument, '_id' | 'id' | 'createdAt' | 'updatedAt'>
>

export interface ComplianceRecord extends ComplianceDocument {
  reporter: string
}

export interface ReporterRecord {
  id: string
  name: string
}

function compliances(database: Db) {
  return database.collection<ComplianceDocument>('compliances')
}

async function addReporterNames(
  database: Db,
  records: ComplianceDocument[],
): Promise<ComplianceRecord[]> {
  const reporterIds = [...new Set(records.map((record) => record.reporterId))]
  const reporters = await database
    .collection<UserDocument>('users')
    .find({ userId: { $in: reporterIds } })
    .project<Pick<UserDocument, 'userId' | 'name'>>({
      _id: 0,
      userId: 1,
      name: 1,
    })
    .toArray()
  const reporterNames = new Map(
    reporters.map((reporter) => [reporter.userId, reporter.name]),
  )

  return records.map((record) => ({
    ...record,
    reporter: reporterNames.get(record.reporterId) ?? '',
  }))
}

export async function listCompliances(
  database: Db,
  reporterId?: string,
): Promise<ComplianceRecord[]> {
  const filter: Filter<ComplianceDocument> = reporterId ? { reporterId } : {}
  const records = await compliances(database)
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .toArray()
  return addReporterNames(database, records)
}

export async function listReporters(database: Db): Promise<ReporterRecord[]> {
  const reporterRoles = await database
    .collection('roles')
    .find({ type: 'reporter' })
    .project<{ userId: string }>({ _id: 0, userId: 1 })
    .toArray()
  const reporterIds = reporterRoles.map((role) => role.userId)
  const users = await database
    .collection<UserDocument>('users')
    .find({ userId: { $in: reporterIds }, status: { $ne: 'Inactive' } })
    .sort({ name: 1 })
    .project<Pick<UserDocument, 'userId' | 'name'>>({
      _id: 0,
      userId: 1,
      name: 1,
    })
    .toArray()

  return users.map((user) => ({ id: user.userId, name: user.name }))
}

export function getCompliance(
  database: Db,
  id: string,
): Promise<ComplianceDocument | null> {
  return compliances(database).findOne({ id })
}

export async function createCompliance(
  database: Db,
  input: ComplianceInput,
): Promise<ComplianceDocument> {
  const document: ComplianceDocument = {
    _id: new ObjectId(),
    ...createComplianceDocument(input),
  }

  await compliances(database).insertOne(document)
  return document
}

export async function updateCompliance(
  database: Db,
  id: string,
  input: UpdateComplianceInput,
): Promise<ComplianceDocument | null> {
  const existingCompliance = await getCompliance(database, id)
  if (!existingCompliance) return null

  const document: ComplianceDocument = {
    ...existingCompliance,
    ...input,
    id: existingCompliance.id,
    updatedAt: new Date(),
  }

  await compliances(database).replaceOne({ id }, document)
  return document
}

export async function saveEvidence(
  database: Db,
  complianceId: string,
  file: {
    content: Buffer
    contentType: string
    filename: string
    uploadedBy: string
    uploadedByEmail: string
  },
): Promise<ComplianceDocument | null> {
  const compliance = await compliances(database).findOne({
    id: complianceId,
    status: { $in: ['In-progress', 'Partial', 'Rejected'] },
  })
  if (!compliance) return null

  const fileId = new ObjectId()
  const metadata: EvidenceFileMetadata = {
    fileId,
    filename: file.filename,
    contentType: file.contentType,
    size: file.content.length,
    link: `/v1/compliances/${complianceId}/evidence/${fileId.toHexString()}`,
    uploadedAt: new Date(),
    uploadedBy: file.uploadedBy,
    uploadedByEmail: file.uploadedByEmail,
  }
  const evidenceFile: EvidenceFileDocument = {
    ...metadata,
    complianceId,
    content: file.content,
  }

  await database
    .collection<EvidenceFileDocument>('complianceEvidence')
    .insertOne(evidenceFile)
  const updated = await compliances(database).findOneAndUpdate(
    {
      id: complianceId,
      status: { $in: ['In-progress', 'Partial', 'Rejected'] },
    },
    { $set: { evidence: [metadata], updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!updated) {
    await database
      .collection<EvidenceFileDocument>('complianceEvidence')
      .deleteOne({ fileId })
  }
  return updated
}

export function submitCompliance(
  database: Db,
  id: string,
  submission: ComplianceSubmission,
): Promise<ComplianceDocument | null> {
  return compliances(database).findOneAndUpdate(
    { id, status: { $in: ['In-progress', 'Partial', 'Rejected'] } },
    {
      $set: {
        status: 'Submitted',
        submission,
        reviewerComments: '',
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  )
}

export function reviewCompliance(
  database: Db,
  id: string,
  decision: ReviewDecision,
  comments: string,
): Promise<ComplianceDocument | null> {
  const statusByDecision = {
    Approve: 'Approved',
    Partial: 'Partial',
    Reject: 'Rejected',
  } as const

  return compliances(database).findOneAndUpdate(
    { id, status: 'Submitted' },
    {
      $set: {
        status: statusByDecision[decision],
        reviewerComments: comments.trim(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  )
}

export async function getEvidenceFile(
  database: Db,
  complianceId: string,
  fileId: string,
): Promise<EvidenceFileDocument | null> {
  if (!ObjectId.isValid(fileId)) return null

  return database
    .collection<EvidenceFileDocument>('complianceEvidence')
    .findOne({
      complianceId,
      fileId: new ObjectId(fileId),
    })
}

export async function deleteCompliance(
  database: Db,
  id: string,
): Promise<boolean> {
  const result = await compliances(database).deleteOne({ id })
  return result.deletedCount === 1
}
