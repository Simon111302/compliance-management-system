import type { RequestHandler } from 'express'
import { recordActivity } from '../services/audit.Service.js'
import {
  createReviewerAction as createReviewerActionRecord,
  deleteReviewerAction as deleteReviewerActionRecord,
  getReviewer,
  getReviewerAction as getReviewerActionRecord,
  listReviewerActions as listReviewerActionRecords,
  updateReviewerAction as updateReviewerActionRecord,
} from '../services/reviewer-action.Service.js'

export const listReviewerActions: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    response.json(await listReviewerActionRecords(request.app.locals.database))
  } catch (error) {
    next(error)
  }
}

export const getReviewerAction: RequestHandler<{ actionId: string }> = async (
  request,
  response,
  next,
) => {
  const actionId = request.validatedObjectIds!.actionId!

  try {
    const action = await getReviewerActionRecord(
      request.app.locals.database,
      actionId,
    )
    if (!action) {
      response.status(404).json({ message: 'Reviewer action not found' })
      return
    }

    response.json(action)
  } catch (error) {
    next(error)
  }
}

export const createReviewerAction: RequestHandler = async (
  request,
  response,
  next,
) => {
  const input = request.validatedReviewerAction!
  const reviewerId = request.validatedObjectIds!.reviewerId!

  try {
    const database = request.app.locals.database
    const reviewer = await getReviewer(database, reviewerId)
    if (!reviewer) {
      response.status(404).json({ message: 'Reviewer not found' })
      return
    }

    const action = await createReviewerActionRecord(
      database,
      input,
      reviewer,
      request.user._id,
    )
    await recordActivity(database, request.user, {
      action: 'CREATE',
      entityType: 'ReviewerAction',
      entityId: action._id.toHexString(),
      description: `Recorded ${action.type} for ${action.reviewerName}`,
      details: { severity: action.severity, status: action.status },
    })
    response.status(201).json(action)
  } catch (error) {
    next(error)
  }
}

export const updateReviewerAction: RequestHandler<{
  actionId: string
}> = async (request, response, next) => {
  const actionId = request.validatedObjectIds!.actionId!
  const reviewerId = request.validatedObjectIds!.reviewerId!
  const input = request.validatedReviewerAction!

  try {
    const database = request.app.locals.database
    const reviewer = await getReviewer(database, reviewerId)
    if (!reviewer) {
      response.status(404).json({ message: 'Reviewer not found' })
      return
    }

    const action = await updateReviewerActionRecord(
      database,
      actionId,
      input,
      reviewer,
    )
    if (!action) {
      response.status(404).json({ message: 'Reviewer action not found' })
      return
    }

    await recordActivity(database, request.user, {
      action: 'UPDATE',
      entityType: 'ReviewerAction',
      entityId: action._id.toHexString(),
      description: `Updated ${action.type} for ${action.reviewerName}`,
      details: { severity: action.severity, status: action.status },
    })
    response.json(action)
  } catch (error) {
    next(error)
  }
}

export const deleteReviewerAction: RequestHandler<{
  actionId: string
}> = async (request, response, next) => {
  const actionId = request.validatedObjectIds!.actionId!

  try {
    const deleted = await deleteReviewerActionRecord(
      request.app.locals.database,
      actionId,
    )
    if (!deleted) {
      response.status(404).json({ message: 'Reviewer action not found' })
      return
    }

    await recordActivity(request.app.locals.database, request.user, {
      action: 'DELETE',
      entityType: 'ReviewerAction',
      entityId: actionId.toHexString(),
      description: `Deleted reviewer action ${actionId.toHexString()}`,
    })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
