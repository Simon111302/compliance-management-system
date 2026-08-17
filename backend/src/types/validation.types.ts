import type { SanitizedSubmission } from './compliance.types.js'

export interface ValidationSuccess<T> {
  valid: true
  errors: []
  data: T
}

export interface ValidationFailure {
  valid: false
  errors: string[]
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure
export type SubmissionValidationResult = ValidationResult<SanitizedSubmission>
