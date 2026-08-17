import type {
  CompliancePriority,
  ComplianceStatus,
  ComplianceType,
} from './common.types.js'

export interface SubmissionEvidenceFile {
  fileId: string
  filename: string
}

export interface SubmissionEvidence {
  reference: string
  file?: SubmissionEvidenceFile
}

export interface ComplianceSubmission {
  type?: ComplianceType
  employeeInformation: Record<string, string>
  rows: Array<Record<string, string>>
  details: Record<string, string>
  evidence: SubmissionEvidence
}

export interface SubmissionForm extends ComplianceSubmission {
  evidenceFile: File | null
}

export interface Compliance {
  id: string
  name: string
  type: ComplianceType
  reporterId?: string
  reporter: string
  dueDate: string
  priority: CompliancePriority
  status: ComplianceStatus
  notes: string
  submission: ComplianceSubmission | null
  reviewerComments: string
}

export interface ComplianceFormData {
  name: string
  type: ComplianceType
  reporterId: string
  reporter: string
  dueDate: string
  priority: CompliancePriority
  notes: string
  status: ComplianceStatus
}

export interface ComplianceSummary {
  open: number
  overdue: number
  completed: number
}
