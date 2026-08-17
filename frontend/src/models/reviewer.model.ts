import type { ReviewerActionForm } from '../types'

export const reviewerActionTypes = [
  'Warning',
  'Incident Report',
  'Sanction',
] as const
export const reviewerActionSeverities = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const
export const reviewerActionStatuses = ['Open', 'Resolved'] as const

export const emptyReviewerActionForm: ReviewerActionForm = {
  reviewerId: '',
  type: reviewerActionTypes[0],
  severity: reviewerActionSeverities[1],
  reason: '',
  notes: '',
  status: reviewerActionStatuses[0],
}
