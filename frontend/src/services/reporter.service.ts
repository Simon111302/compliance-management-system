import { apiRequest, ApiRequestError, jsonOptions } from '../config/api'
import { toCompliance, type ApiCompliance } from './compliance.service'
import type { Compliance, ComplianceSubmission } from '../types'

const compliancePath = '/compliances'

export async function uploadComplianceEvidence(
  complianceId: string,
  file: File,
): Promise<Compliance> {
  const compliance = await apiRequest<ApiCompliance>(
    `${compliancePath}/${complianceId}/evidence`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(file.name),
        'X-File-Type': file.type,
      },
      body: file,
    },
    'Compliance request failed',
  )
  return toCompliance(compliance)
}

export async function submitComplianceForm(
  complianceId: string,
  submission: ComplianceSubmission,
): Promise<Compliance> {
  try {
    const compliance = await apiRequest<ApiCompliance>(
      `${compliancePath}/${complianceId}/submission`,
      jsonOptions('PUT', submission),
      'Compliance request failed',
    )
    return toCompliance(compliance)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      throw new Error(
        'The API server is out of date. Restart the backend server.',
      )
    }
    throw error
  }
}
