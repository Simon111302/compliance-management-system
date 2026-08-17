import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import type { AuditLog } from '../../types'

interface AuditLogsProps {
  logs: AuditLog[]
}

export function AuditLogs({ logs }: AuditLogsProps) {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Audit Logs"
        description="Review administrative and compliance activity."
      />
      <div className="reviewer-content">
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id ?? log._id}>
                    <td>
                      {log.userName ?? log.userEmail ?? 'System'}
                      {log.userRole ? ` (${log.userRole})` : ''}
                    </td>
                    <td>{log.action}</td>
                    <td>{log.entity}</td>
                    <td>{log.description}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && (
            <div className="empty-state">
              <strong>No audit logs found</strong>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
