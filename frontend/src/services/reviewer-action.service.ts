import { apiRequest, jsonOptions } from '../config/api'
import type { ReviewerAction, ReviewerActionForm } from '../types'

const reviewerActionPath = '/reviewer-actions'

export function getReviewerActions(): Promise<ReviewerAction[]> {
  return apiRequest(reviewerActionPath, undefined, 'Admin request failed')
}

export function createReviewerAction(
  action: ReviewerActionForm,
): Promise<ReviewerAction> {
  return apiRequest(
    reviewerActionPath,
    jsonOptions('POST', action),
    'Admin request failed',
  )
}

export function updateReviewerAction(
  actionId: string,
  action: ReviewerActionForm,
): Promise<ReviewerAction> {
  return apiRequest(
    `${reviewerActionPath}/${actionId}`,
    jsonOptions('PUT', action),
    'Admin request failed',
  )
}

export function deleteReviewerAction(
  actionId: string | undefined,
): Promise<null> {
  return apiRequest(
    `${reviewerActionPath}/${actionId}`,
    { method: 'DELETE' },
    'Admin request failed',
  )
}
