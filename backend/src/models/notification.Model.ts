import { randomUUID } from 'node:crypto'
import type { ObjectId } from 'mongodb'

export type NotificationType =
  'ComplianceAssigned' | 'ComplianceSubmitted' | 'ComplianceReviewed'

export interface NotificationDocument {
  _id: ObjectId
  notificationId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  complianceId: string
  readAt: Date | null
  createdAt: Date
}

export interface NotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  complianceId: string
}

export function createNotificationDocument(
  input: NotificationInput,
  createdAt = new Date(),
): Omit<NotificationDocument, '_id'> {
  return {
    notificationId: randomUUID(),
    ...input,
    readAt: null,
    createdAt,
  }
}
