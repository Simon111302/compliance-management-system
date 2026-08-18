export type UserRole = 'Admin' | 'Reviewer' | 'Reporter'
export type UserStatus = 'Active' | 'Inactive'

export interface Reporter {
  id: string
  name: string
}

export type ComplianceType =
  | 'Government Contribution'
  | 'Tax Compliance'
  | 'Employee Records'
  | 'Regulatory Filing'
export type CompliancePriority = 'Urgent' | 'High' | 'Medium' | 'Low'
export type ComplianceStatus =
  | 'Pending'
  | 'Pending Evidence'
  | 'Overdue'
  | 'Approved'
  | 'Partial'
  | 'Rejected'
export type ReviewDecision = '' | 'Approve' | 'Partial' | 'Reject'
