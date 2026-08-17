import type { RequestHandler } from 'express'
import { parseObjectId } from '../utils/helpers/sanitize.js'
import { validateReviewerAction } from '../utils/validators/review.validator.js'

export function validateRequest(
  validator: (value: unknown) => boolean,
  message = 'Invalid request data',
): RequestHandler {
  return (request, response, next) => {
    if (!validator(request.body)) {
      response.status(400).json({ message })
      return
    }

    next()
  }
}

export const validateReviewerActionBody: RequestHandler = (
  request,
  response,
  next,
) => {
  const validation = validateReviewerAction(request.body)
  if (!validation.valid) {
    response.status(400).json({ message: validation.errors.join('; ') })
    return
  }

  request.validatedReviewerAction = validation.data
  request.validatedObjectIds ??= {}
  request.validatedObjectIds.reviewerId = parseObjectId(
    validation.data.reviewerId,
  )!
  next()
}

export function validateObjectIdParam(parameter: string): RequestHandler {
  return (request, response, next) => {
    const objectId = parseObjectId(request.params[parameter])
    if (!objectId) {
      response.status(400).json({
        message: `${parameter} must be a valid ObjectId`,
      })
      return
    }

    request.validatedObjectIds ??= {}
    request.validatedObjectIds[parameter] = objectId
    next()
  }
}
