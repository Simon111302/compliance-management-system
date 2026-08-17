export interface AuditLog {
  id?: string
  _id?: string
  userName?: string
  userEmail?: string
  userRole?: string
  action: string
  entity?: string
  description: string
  createdAt: string
}

export interface AdminDashboardData {
  summary: {
    totalUsers?: number
    reviewers?: number
    reporters?: number
    complianceIssues?: number
  }
  recentActivity: AuditLog[]
}
