import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import './AdminDashboard.css'

export function AdminDashboard({ dashboard, onNavigate }) {
  const summary = dashboard?.summary ?? {}
  const activity = dashboard?.recentActivity ?? []

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Manage people, Reviewer actions, and compliance activity."
      />
      <div className="reviewer-content">
        <section className="admin-summary-grid">
          {[
            ['Total Users', summary.totalUsers ?? 0],
            ['Reviewers', summary.reviewers ?? 0],
            ['Reporters', summary.reporters ?? 0],
            ['Compliance Issues', summary.complianceIssues ?? 0],
          ].map(([label, value]) => (
            <article
              className="admin-summary-card"
              key={label}
            >
              <p>{label}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest administrative and compliance changes.</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate('audit-logs')}
            >
              View audit logs
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={item.id ?? item._id}>
                    <td>{item.userName ?? item.userEmail ?? 'System'}</td>
                    <td>{item.action}</td>
                    <td>{item.entity ?? 'System'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activity.length === 0 && (
            <div className="empty-state">
              <strong>No recent activity</strong>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
