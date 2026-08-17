import type { Binary, ObjectId } from 'mongodb'

export const compliancePriorities = ['Urgent', 'High', 'Medium', 'Low'] as const
export type CompliancePriority = (typeof compliancePriorities)[number]

export const complianceStatuses = [
  'In-progress',
  'Submitted',
  'Partial',
  'Rejected',
  'Approved',
] as const
export type ComplianceStatus = (typeof complianceStatuses)[number]

export interface EvidenceFileMetadata {
  fileId: ObjectId
  filename: string
  contentType: string
  size: number
  link: string
  uploadedAt: Date
  uploadedBy: string
  uploadedByEmail: string
}

export interface EvidenceFileDocument extends EvidenceFileMetadata {
  complianceId: string
  content: Buffer | Binary
}

export interface ComplianceSubmission {
  [key: string]: unknown
}

export interface ComplianceDocument {
  _id: ObjectId
  id: string
  name: string
  type: string
  reporterId: string
  dueDate: string
  priority: CompliancePriority
  status: ComplianceStatus
  notes: string
  evidence: EvidenceFileMetadata[]
  submission: ComplianceSubmission | null
  reviewerComments: string
  createdAt: Date
  updatedAt: Date
}

export interface ComplianceInput {
  id: string
  name: string
  type: string
  reporterId: string
  dueDate: string
  priority: CompliancePriority
  status?: ComplianceStatus
  notes?: string
}

export function createComplianceDocument(
  input: ComplianceInput,
  createdAt = new Date(),
): Omit<ComplianceDocument, '_id'> {
  return {
    id: input.id.trim(),
    name: input.name.trim(),
    type: input.type.trim(),
    reporterId: input.reporterId,
    dueDate: input.dueDate,
    priority: input.priority,
    status: input.status ?? 'In-progress',
    notes: input.notes?.trim() ?? '',
    evidence: [],
    submission: null,
    reviewerComments: '',
    createdAt,
    updatedAt: createdAt,
  }
}
