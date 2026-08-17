import { apiRequest, ApiRequestError, jsonOptions } from '../config/api'
import type { Compliance, ComplianceSubmission } from '../types'

const compliancePath = '/compliances'

export function uploadComplianceEvidence(
  complianceId: string,
  file: File,
): Promise<Compliance> {
  return apiRequest(
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
}

export async function submitComplianceForm(
  complianceId: string,
  submission: ComplianceSubmission,
): Promise<Compliance> {
  try {
    return await apiRequest(
      `${compliancePath}/${complianceId}/submission`,
      jsonOptions('PUT', submission),
      'Compliance request failed',
    )
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      throw new Error(
        'The API server is out of date. Restart the backend server.',
      )
    }
    throw error
  }
}
