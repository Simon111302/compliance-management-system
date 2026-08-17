import {
  compliancePriorities,
  complianceStatuses,
  type CompliancePriority,
  type ComplianceStatus,
} from '../../models/compliance.Model.js'
import type { SubmissionInput } from '../../types/compliance.types.js'
import type { SubmissionValidationResult } from '../../types/validation.types.js'
import { submissionSchemas, type FieldRule } from './compliance.schema.js'
import {
  isObject,
  sanitizeEvidence,
  sanitizeFields,
} from '../helpers/sanitize.js'

export function isCompliancePriority(
  value: unknown,
): value is CompliancePriority {
  return compliancePriorities.some((priority) => priority === value)
}

export function isComplianceStatus(value: unknown): value is ComplianceStatus {
  return complianceStatuses.some((status) => status === value)
}

export function validateComplianceSubmission(
  type: string,
  input: unknown,
  hasUploadedFile: boolean,
): SubmissionValidationResult {
  const schema = submissionSchemas[type]
  const errors: string[] = []

  if (!schema || !isObject(input)) {
    return { valid: false, errors: ['Invalid compliance submission'] }
  }
  const submissionInput: SubmissionInput = input

  const employeeRules: Record<string, FieldRule> = Object.fromEntries(
    schema.employeeFields.map((field) => [
      field,
      schema.employeeFieldRules?.[field] ?? {},
    ]),
  )
  const employeeInformation = sanitizeFields(
    submissionInput.employeeInformation,
    employeeRules,
    'employeeInformation',
    errors,
  )

  if (
    !Array.isArray(submissionInput.rows) ||
    submissionInput.rows.length !== schema.rowLabels.length
  ) {
    errors.push(`rows must contain ${schema.rowLabels.length} records`)
  }
  const rowsInput = Array.isArray(submissionInput.rows)
    ? submissionInput.rows
    : []
  const rows = schema.rowLabels.map((label, index) => ({
    label,
    ...sanitizeFields(
      rowsInput[index],
      schema.rowFields,
      `rows.${index}`,
      errors,
    ),
  }))
  const details = sanitizeFields(
    submissionInput.details,
    schema.detailFields,
    'details',
    errors,
  )
  const evidence = sanitizeEvidence(
    submissionInput.evidence,
    hasUploadedFile,
    errors,
  )

  if (errors.length > 0) return { valid: false, errors }
  return {
    valid: true,
    errors: [],
    data: { employeeInformation, rows, details, evidence },
  }
}
