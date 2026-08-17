import { apiRequest, jsonOptions } from '../config/api'
import type { Compliance, Reporter, ReviewDecision } from '../types'

const compliancePath = '/compliances'

export function getReporters(): Promise<Reporter[]> {
  return apiRequest(
    `${compliancePath}/reporters`,
    undefined,
    'Compliance request failed',
  )
}

export function saveReview(
  complianceId: string,
  decision: Exclude<ReviewDecision, ''>,
  comments: string,
): Promise<Compliance> {
  return apiRequest(
    `${compliancePath}/${complianceId}/review`,
    jsonOptions('PATCH', { comments, decision }),
    'Compliance request failed',
  )
}
