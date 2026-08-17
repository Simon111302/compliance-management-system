import type { AdminDashboardData } from '../types'
import { getAuditLogs } from './audit.service'
import { getCompliances } from './compliance.service'
import { getUsers } from './user.service'

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [users, audits, compliances] = await Promise.all([
    getUsers(),
    getAuditLogs(),
    getCompliances(),
  ])

  return {
    summary: {
      totalUsers: users.length,
      reviewers: users.filter((user) => user.role === 'Reviewer').length,
      reporters: users.filter((user) => user.role === 'Reporter').length,
      complianceIssues: compliances.length,
    },
    recentActivity: audits.slice(0, 5),
  }
}
