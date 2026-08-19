import { useEffect, useRef, useState } from 'react'
import type { Notification } from '../../../types'
import './NotificationBell.css'

interface NotificationBellProps {
  notifications: readonly Notification[]
  unreadCount: number
  onMarkAllRead: () => void | Promise<void>
  onOpen: (notification: Notification) => void | Promise<void>
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  onOpen,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

  return (
    <div
      className="notification-bell"
      ref={containerRef}
    >
      <button
        className="notification-trigger"
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-count">{Math.min(unreadCount, 9)}</span>
        )}
      </button>
      {open && (
        <section className="notification-menu">
          <div className="notification-menu-heading">
            <div>
              <strong>Notifications</strong>
              <small>{unreadCount} unread</small>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void onMarkAllRead()}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length ? (
              notifications.map((notification) => (
                <button
                  key={notification.notificationId}
                  className={`notification-item ${notification.readAt ? '' : 'unread'}`}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    void onOpen(notification)
                  }}
                >
                  <span className="notification-dot" />
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{notification.message}</small>
                    <time dateTime={notification.createdAt}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                  </span>
                </button>
              ))
            ) : (
              <div className="notification-empty">No notifications yet.</div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
