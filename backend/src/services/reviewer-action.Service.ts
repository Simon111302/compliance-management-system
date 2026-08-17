import { ObjectId, type Db } from 'mongodb'
import type {
  ReviewerActionDocument,
  ReviewerActionInput,
} from '../types/reviewer-action.types.js'
import type { UserDocument } from '../types/user.types.js'

interface ReviewerIdentity {
  _id: ObjectId
  name: string
  email: string
}

function reviewerActions(database: Db) {
  return database.collection<ReviewerActionDocument>('reviewerActions')
}

export function listReviewerActions(
  database: Db,
): Promise<ReviewerActionDocument[]> {
  return reviewerActions(database).find({}).sort({ createdAt: -1 }).toArray()
}

export function getReviewerAction(
  database: Db,
  actionId: ObjectId,
): Promise<ReviewerActionDocument | null> {
  return reviewerActions(database).findOne({ _id: actionId })
}

export async function getReviewer(
  database: Db,
  reviewerId: ObjectId,
): Promise<ReviewerIdentity | null> {
  const reviewer = await database
    .collection<UserDocument>('users')
    .findOne({ _id: reviewerId })
  if (!reviewer) return null

  return {
    _id: reviewer._id,
    name: reviewer.name,
    email: reviewer.email,
  }
}

export async function createReviewerAction(
  database: Db,
  input: ReviewerActionInput,
  reviewer: ReviewerIdentity,
  createdBy: ObjectId,
): Promise<ReviewerActionDocument> {
  const document: ReviewerActionDocument = {
    _id: new ObjectId(),
    reviewerId: reviewer._id,
    reviewerName: reviewer.name,
    reviewerEmail: reviewer.email,
    type: input.type,
    severity: input.severity,
    reason: input.reason.trim(),
    notes: input.notes?.trim() ?? '',
    status: input.status,
    createdBy,
    createdAt: new Date(),
  }

  await reviewerActions(database).insertOne(document)
  return document
}

export async function updateReviewerAction(
  database: Db,
  actionId: ObjectId,
  input: ReviewerActionInput,
  reviewer: ReviewerIdentity,
): Promise<ReviewerActionDocument | null> {
  const existingAction = await getReviewerAction(database, actionId)
  if (!existingAction) return null

  const document: ReviewerActionDocument = {
    ...existingAction,
    reviewerId: reviewer._id,
    reviewerName: reviewer.name,
    reviewerEmail: reviewer.email,
    type: input.type,
    severity: input.severity,
    reason: input.reason.trim(),
    notes: input.notes?.trim() ?? '',
    status: input.status,
  }

  await reviewerActions(database).replaceOne({ _id: actionId }, document)
  return document
}

export async function deleteReviewerAction(
  database: Db,
  actionId: ObjectId,
): Promise<boolean> {
  const result = await reviewerActions(database).deleteOne({ _id: actionId })
  return result.deletedCount === 1
}
