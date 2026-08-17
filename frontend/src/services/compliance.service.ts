import { apiRequest, apiUrl, jsonOptions } from '../config/api'
import type { Compliance, ComplianceStatus } from '../types'

const compliancePath = '/compliances'

type ApiComplianceStatus =
  'In-progress' | 'Submitted' | 'Partial' | 'Rejected' | 'Approved'

export interface ApiCompliance extends Omit<Compliance, 'reporter' | 'status'> {
  evidence?: Array<{ fileId: string; filename: string }>
  reporter?: string
  status: ApiComplianceStatus
}

const frontendStatusByApiStatus: Record<ApiComplianceStatus, ComplianceStatus> =
  {
    'In-progress': 'Pending',
    Submitted: 'Pending Evidence',
    Partial: 'Partial',
    Rejected: 'Rejected',
    Approved: 'Approved',
  }

export function toCompliance(
  compliance: ApiCompliance,
  reporter = compliance.reporter ?? '',
): Compliance {
  const evidenceFile = compliance.evidence?.[0]
  const submission = compliance.submission
    ? {
        ...compliance.submission,
        evidence: {
          ...compliance.submission.evidence,
          ...(evidenceFile ? { file: evidenceFile } : {}),
        },
      }
    : null

  return {
    ...compliance,
    reporter,
    status: frontendStatusByApiStatus[compliance.status],
    submission,
  }
}

function complianceInput(compliance: Compliance) {
  return {
    id: compliance.id,
    name: compliance.name,
    type: compliance.type,
    reporterId: compliance.reporterId,
    dueDate: compliance.dueDate,
    priority: compliance.priority,
    notes: compliance.notes,
  }
}

export async function getCompliances(): Promise<Compliance[]> {
  const compliances = await apiRequest<ApiCompliance[]>(
    compliancePath,
    undefined,
    'Compliance request failed',
  )
  return compliances.map((compliance) => toCompliance(compliance))
}

export async function addCompliance(
  compliance: Compliance,
): Promise<Compliance> {
  const created = await apiRequest<ApiCompliance>(
    compliancePath,
    jsonOptions('POST', complianceInput(compliance)),
    'Compliance request failed',
  )
  return toCompliance(created, compliance.reporter)
}

export async function saveCompliance(
  compliance: Compliance,
): Promise<Compliance> {
  const saved = await apiRequest<ApiCompliance>(
    `${compliancePath}/${compliance.id}`,
    jsonOptions('PUT', complianceInput(compliance)),
    'Compliance request failed',
  )
  return toCompliance(saved, compliance.reporter)
}

export function evidenceUrl(complianceId: string, fileId: string): string {
  return `${apiUrl}${compliancePath}/${complianceId}/evidence/${fileId}`
}
