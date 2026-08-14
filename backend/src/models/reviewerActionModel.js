export const reviewerActionTypes = ['Warning', 'Incident Report', 'Sanction']
export const reviewerActionSeverities = ['Low', 'Medium', 'High', 'Critical']
export const reviewerActionStatuses = ['Open', 'Resolved']

export function createReviewerActionDocument(
  input,
  reviewer,
  createdBy,
  createdAt = new Date(),
) {
  return {
    reviewerId: reviewer._id,
    reviewerName: reviewer.name,
    reviewerEmail: reviewer.email,
    type: input.type,
    severity: input.severity,
    reason: input.reason.trim(),
    notes: input.notes?.trim() ?? '',
    status: input.status,
    createdBy,
    createdAt,
  }
}
