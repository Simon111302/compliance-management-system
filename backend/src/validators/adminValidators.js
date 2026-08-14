import { ObjectId } from 'mongodb'
import { userRoles } from '../models/userModel.js'
import {
  reviewerActionSeverities,
  reviewerActionStatuses,
  reviewerActionTypes,
} from '../models/reviewerActionModel.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function result(errors) {
  return { valid: errors.length === 0, errors }
}

function validateString(value, field, errors) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} is required`)
  }
}

function validateUserFields(input, requirePassword) {
  const errors = []

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return result(['Request body must be an object'])
  }

  validateString(input.firstName, 'firstName', errors)
  validateString(input.lastName, 'lastName', errors)
  validateString(input.email, 'email', errors)

  if (
    typeof input.email === 'string' &&
    !emailPattern.test(input.email.trim())
  ) {
    errors.push('email must be a valid email address')
  }

  if (requirePassword) validateString(input.password, 'password', errors)
  if (!userRoles.includes(input.role)) {
    errors.push(`role must be one of: ${userRoles.join(', ')}`)
  }

  return result(errors)
}

export function validateCreateUser(input) {
  return validateUserFields(input, true)
}

export function validateUpdateUser(input) {
  return validateUserFields(input, false)
}

export function validateResetPassword(input) {
  const errors = []

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return result(['Request body must be an object'])
  }

  validateString(input.password, 'password', errors)
  return result(errors)
}

function validateReviewerActionFields(input) {
  const errors = []

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return result(['Request body must be an object'])
  }

  if (
    typeof input.reviewerId !== 'string' ||
    !ObjectId.isValid(input.reviewerId)
  ) {
    errors.push('reviewerId must be a valid ObjectId')
  }
  if (!reviewerActionTypes.includes(input.type)) {
    errors.push(`type must be one of: ${reviewerActionTypes.join(', ')}`)
  }
  if (!reviewerActionSeverities.includes(input.severity)) {
    errors.push(
      `severity must be one of: ${reviewerActionSeverities.join(', ')}`,
    )
  }
  validateString(input.reason, 'reason', errors)
  if (input.notes !== undefined && typeof input.notes !== 'string') {
    errors.push('notes must be a string')
  }
  if (!reviewerActionStatuses.includes(input.status)) {
    errors.push(`status must be one of: ${reviewerActionStatuses.join(', ')}`)
  }

  return result(errors)
}

export function validateReviewerAction(input) {
  return validateReviewerActionFields(input)
}

export function parseObjectId(value) {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) return null
  return ObjectId.createFromHexString(value)
}

export function validationMessage(validation) {
  return validation.errors.join('; ')
}
