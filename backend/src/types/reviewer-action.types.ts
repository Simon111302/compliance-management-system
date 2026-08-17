import type { Document, ObjectId } from 'mongodb'

export type ReviewerActionType = 'Warning' | 'Incident Report' | 'Sanction'
export type ReviewerActionSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type ReviewerActionStatus = 'Open' | 'Resolved'
export type ReviewDecision = 'Approve' | 'Partial' | 'Reject'

export interface ReviewerActionDocument extends Document {
  _id: ObjectId
  reviewerId: ObjectId
  reviewerName: string
  reviewerEmail: string
  type: ReviewerActionType
  severity: ReviewerActionSeverity
  reason: string
  notes: string
  status: ReviewerActionStatus
  createdBy: ObjectId
  createdAt: Date
}

export interface ReviewerActionInput {
  reviewerId: string
  type: ReviewerActionType
  severity: ReviewerActionSeverity
  reason: string
  notes?: string
  status: ReviewerActionStatus
}

export interface ReviewInput {
  decision?: unknown
  comments?: unknown
}
