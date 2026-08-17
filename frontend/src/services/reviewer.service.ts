import { apiRequest, jsonOptions } from '../config/api'
import { toCompliance, type ApiCompliance } from './compliance.service'
import type { Compliance, Reporter, ReviewDecision } from '../types'

const compliancePath = '/compliances'

export function getReporters(): Promise<Reporter[]> {
  return apiRequest(
    `${compliancePath}/reporters`,
    undefined,
    'Compliance request failed',
  )
}

export async function saveReview(
  complianceId: string,
  decision: Exclude<ReviewDecision, ''>,
  comments: string,
): Promise<Compliance> {
  const reviewed = await apiRequest<ApiCompliance>(
    `${compliancePath}/${complianceId}/review`,
    jsonOptions('PATCH', { comments, decision }),
    'Compliance request failed',
  )
  return toCompliance(reviewed)
}
