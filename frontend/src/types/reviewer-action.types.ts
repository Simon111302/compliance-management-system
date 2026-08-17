export type ReviewerActionType = 'Warning' | 'Incident Report' | 'Sanction'
export type ReviewerActionSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type ReviewerActionStatus = 'Open' | 'Resolved'

export interface ReviewerActionForm {
  reviewerId: string
  type: ReviewerActionType
  severity: ReviewerActionSeverity
  reason: string
  notes: string
  status: ReviewerActionStatus
}

export interface ReviewerAction extends ReviewerActionForm {
  id?: string
  _id?: string
  reviewerName: string
  reviewerEmail: string
  createdAt: string
}

export interface Reporter {
  id: string
  name: string
}
