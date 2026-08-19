export type NotificationType =
  'ComplianceAssigned' | 'ComplianceSubmitted' | 'ComplianceReviewed'

export interface Notification {
  notificationId: string
  type: NotificationType
  title: string
  message: string
  complianceId: string
  readAt: string | null
  createdAt: string
}
