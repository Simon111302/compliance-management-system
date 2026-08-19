import type {
  Compliance,
  ComplianceSummary,
  Notification,
  ReviewerPage,
  UserRole,
} from '../../types'
import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import { PriorityBadge, StatusBadge } from '../../views/components/Badge/Badge'
import { NotificationBell } from '../../views/components/NotificationBell/NotificationBell'
import './Dashboard.css'

interface DashboardProps {
  compliances: readonly Compliance[]
  notifications: readonly Notification[]
  role: UserRole | 'Administration'
  summary: ComplianceSummary
  unreadNotificationCount: number
  onMarkAllNotificationsRead: () => void | Promise<void>
  onMarkNotificationRead: (notificationId: string) => void | Promise<void>
  onNavigate: (page: ReviewerPage) => void
  onOpenDetails: (complianceId: string) => void
}

export function Dashboard({
  compliances,
  notifications,
  role,
  summary,
  unreadNotificationCount,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onNavigate,
  onOpenDetails,
}: DashboardProps) {
  const isReporter = role === 'Reporter'

  return (
    <>
      <PageHeader
        eyebrow={`${role} workspace`}
        title="Compliance Dashboard"
        description={
          isReporter
            ? 'Monitor compliance records assigned to your account.'
            : 'Monitor submissions and focus on items that need a decision.'
        }
        action={
          role !== 'Administration' ? (
            <div className="desktop-notification">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadNotificationCount}
                onMarkAllRead={onMarkAllNotificationsRead}
                onOpen={async (notification) => {
                  if (!notification.readAt) {
                    await onMarkNotificationRead(notification.notificationId)
                  }
                  onOpenDetails(notification.complianceId)
                }}
              />
            </div>
          ) : undefined
        }
      />
      <div className="reviewer-content">
        <section
          className="summary-grid"
          aria-label="Compliance summary"
        >
          <article className="summary-card">
            <div>
              <p>Open</p>
              <strong>{summary.open}</strong>
              <small>Awaiting completion</small>
            </div>
          </article>
          <article className="summary-card">
            <div>
              <p>Overdue</p>
              <strong>{summary.overdue}</strong>
              <small>Past due date</small>
            </div>
          </article>
          <article className="summary-card">
            <div>
              <p>Completed</p>
              <strong>{summary.completed}</strong>
              <small>Approved submissions</small>
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Compliance</h2>
              <p>Latest compliance records assigned to your team.</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate('compliance')}
            >
              View all
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Compliance Name</th>
                  <th>Reporter</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {compliances.slice(0, 5).map((compliance) => (
                  <tr key={compliance.id}>
                    <td>
                      <button
                        className="id-link"
                        type="button"
                        onClick={() => onOpenDetails(compliance.id)}
                      >
                        {compliance.id}
                      </button>
                    </td>
                    <td>
                      <strong>{compliance.name}</strong>
                      <small>{compliance.type}</small>
                    </td>
                    <td>{compliance.reporter}</td>
                    <td>
                      <PriorityBadge priority={compliance.priority} />
                    </td>
                    <td>
                      <StatusBadge status={compliance.status} />
                    </td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        aria-label={`View ${compliance.id}`}
                        onClick={() => onOpenDetails(compliance.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
