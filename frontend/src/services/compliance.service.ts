import { apiRequest, apiUrl, jsonOptions } from '../config/api'
import type { Compliance } from '../types'

const compliancePath = '/compliances'

export function getCompliances(): Promise<Compliance[]> {
  return apiRequest(compliancePath, undefined, 'Compliance request failed')
}

export function addCompliance(compliance: Compliance): Promise<Compliance> {
  return apiRequest(
    compliancePath,
    jsonOptions('POST', compliance),
    'Compliance request failed',
  )
}

export function saveCompliance(compliance: Compliance): Promise<Compliance> {
  return apiRequest(
    `${compliancePath}/${compliance.id}`,
    jsonOptions('PUT', compliance),
    'Compliance request failed',
  )
}

export function evidenceUrl(complianceId: string, fileId: string): string {
  return `${apiUrl}${compliancePath}/${complianceId}/evidence/${fileId}`
}
