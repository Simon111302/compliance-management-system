import { ObjectId } from 'mongodb'
import type { FieldRule } from '../validators/compliance.schema.js'

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function parseObjectId(value: unknown): ObjectId | null {
  return typeof value === 'string' && ObjectId.isValid(value)
    ? ObjectId.createFromHexString(value)
    : null
}

export function sanitizeField(
  value: unknown,
  rule: FieldRule,
  fieldName: string,
  errors: string[],
): string {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return ''
  }

  const sanitized = value.trim()
  if (!rule.optional && !sanitized) errors.push(`${fieldName} is required`)
  if (sanitized.length > (rule.maxLength ?? 300)) {
    errors.push(`${fieldName} is too long`)
  }
  if (
    rule.type === 'number' &&
    sanitized &&
    (!Number.isFinite(Number(sanitized)) || Number(sanitized) < 0)
  ) {
    errors.push(`${fieldName} must be a non-negative number`)
  }
  if (
    rule.type === 'date' &&
    sanitized &&
    !/^\d{4}-\d{2}-\d{2}$/.test(sanitized)
  ) {
    errors.push(`${fieldName} must be a valid date`)
  }
  if (rule.options && sanitized && !rule.options.includes(sanitized)) {
    errors.push(`${fieldName} must be one of: ${rule.options.join(', ')}`)
  }

  return sanitized
}

export function sanitizeFields(
  input: unknown,
  rules: Record<string, FieldRule>,
  prefix: string,
  errors: string[],
): Record<string, string> {
  if (!isObject(input)) {
    errors.push(`${prefix} must be an object`)
    return Object.fromEntries(Object.keys(rules).map((field) => [field, '']))
  }

  return Object.fromEntries(
    Object.entries(rules).map(([field, rule]) => [
      field,
      sanitizeField(input[field], rule, `${prefix}.${field}`, errors),
    ]),
  )
}

export function sanitizeEvidence(
  input: unknown,
  hasUploadedFile: boolean,
  errors: string[],
): { reference: string } {
  const reference = sanitizeField(
    isObject(input) ? (input.reference ?? '') : '',
    { optional: true, maxLength: 1000 },
    'evidence.reference',
    errors,
  )

  if (!reference && !hasUploadedFile) {
    errors.push('Upload an evidence file or provide an evidence reference/link')
  }

  return { reference }
}
