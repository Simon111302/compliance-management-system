import {
  auditActions,
  type AuditAction,
  type AuditInput,
} from '../../models/audit.Model.js'
import type {
  ReviewDecision,
  ReviewerActionInput,
} from '../../types/reviewer-action.types.js'
import type { ValidationResult } from '../../types/validation.types.js'
import { isObject } from '../helpers/sanitize.js'

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

export function isAuditAction(value: unknown): value is AuditAction {
  return auditActions.some((action) => action === value)
}

export function isAuditDetails(value: unknown): value is AuditInput['details'] {
  return value === undefined || typeof value === 'string' || isObject(value)
}

export function validateReviewInput(
  decision: unknown,
): decision is ReviewDecision {
  return (
    typeof decision === 'string' &&
    ['Approve', 'Partial', 'Reject'].includes(decision)
  )
}

export function validateReviewerAction(
  input: unknown,
): ValidationResult<ReviewerActionInput> {
  if (!isObject(input)) {
    return { valid: false, errors: ['Request body must be an object'] }
  }
  const errors: string[] = []
  const reviewerId =
    typeof input.reviewerId === 'string' ? input.reviewerId : ''
  if (!/^[a-f\d]{24}$/i.test(reviewerId)) {
    errors.push('reviewerId must be a valid ObjectId')
  }
  const type = reviewerActionTypes.find((candidate) => candidate === input.type)
  if (!type)
    errors.push(`type must be one of: ${reviewerActionTypes.join(', ')}`)
  const severity = reviewerActionSeverities.find(
    (candidate) => candidate === input.severity,
  )
  if (!severity) {
    errors.push(
      `severity must be one of: ${reviewerActionSeverities.join(', ')}`,
    )
  }
  const reason = typeof input.reason === 'string' ? input.reason : ''
  if (!reason.trim()) errors.push('reason is required')
  if (input.notes !== undefined && typeof input.notes !== 'string') {
    errors.push('notes must be a string')
  }
  const status = reviewerActionStatuses.find(
    (candidate) => candidate === input.status,
  )
  if (!status) {
    errors.push(`status must be one of: ${reviewerActionStatuses.join(', ')}`)
  }

  const data = {
    reviewerId,
    type: type ?? 'Warning',
    severity: severity ?? 'Low',
    reason,
    ...(typeof input.notes === 'string' ? { notes: input.notes } : {}),
    status: status ?? 'Open',
  }
  return errors.length === 0
    ? { valid: true, errors: [], data }
    : { valid: false, errors }
}
