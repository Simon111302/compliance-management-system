import type { Document, ObjectId } from 'mongodb'
import type {
  ComplianceDocument as ComplianceModel,
  ComplianceInput as ComplianceModelInput,
  ComplianceSubmission,
  EvidenceFileMetadata,
} from '../models/compliance.Model.js'

export interface ComplianceDocument extends ComplianceModel, Document {
  reporterEmail?: string
  reporter?: string
  evidenceFile?: EvidenceFileMetadata | null
  [key: string]: unknown
}

export interface ComplianceSubmissionLegacy extends ComplianceSubmission {
  type: string
  employeeInformation: Record<string, string>
  rows: Array<Record<string, string>>
  details: Record<string, string>
  evidence: { reference: string; file: EvidenceFileMetadata | null }
  submittedAt: Date
  submittedBy: ObjectId
  submittedByEmail: string
}

export type ComplianceInput = ComplianceModelInput & {
  [key: string]: unknown
}

export interface SubmissionInput {
  employeeInformation?: unknown
  rows?: unknown
  details?: unknown
  evidence?: unknown
}

export interface SanitizedSubmission {
  employeeInformation: Record<string, string>
  rows: Array<Record<string, string>>
  details: Record<string, string>
  evidence: { reference: string }
}
