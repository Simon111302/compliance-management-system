import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getNotifications,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  markNotificationRead as markNotificationReadRequest,
} from '../services/notification.service'
import type { Notification } from '../types'

export function useNotificationController(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadNotifications = useCallback(async () => {
    if (!enabled) return
    try {
      setNotifications(await getNotifications())
    } catch {
      return
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setNotifications([])
      return undefined
    }

    void loadNotifications()
    const interval = window.setInterval(() => void loadNotifications(), 30000)
    return () => window.clearInterval(interval)
  }, [enabled, loadNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  )

  const markRead = useCallback(async (notificationId: string) => {
    const updated = await markNotificationReadRequest(notificationId)
    setNotifications((current) =>
      current.map((notification) =>
        notification.notificationId === notificationId ? updated : notification,
      ),
    )
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsReadRequest()
    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, readAt })),
    )
  }, [])

  return {
    markAllRead,
    markRead,
    notifications,
    unreadCount,
  }
}
