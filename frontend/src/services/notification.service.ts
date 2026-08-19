import { apiRequest } from '../config/api'
import type { Notification } from '../types'

const notificationPath = '/notifications'

export function getNotifications(): Promise<Notification[]> {
  return apiRequest(notificationPath, undefined, 'Notification request failed')
}

export function markNotificationRead(
  notificationId: string,
): Promise<Notification> {
  return apiRequest(
    `${notificationPath}/${notificationId}/read`,
    { method: 'PATCH' },
    'Notification request failed',
  )
}

export function markAllNotificationsRead(): Promise<null> {
  return apiRequest(
    `${notificationPath}/read-all`,
    { method: 'PATCH' },
    'Notification request failed',
  )
}
