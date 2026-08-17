import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import type { ReviewerAction } from '../../types'
import './Actors.css'

interface ActorsProps {
  actions: ReviewerAction[]
  onAdd: () => void
  onDelete: (action: ReviewerAction) => void
  onEdit: (action: ReviewerAction) => void
}

export function Actors({ actions, onAdd, onDelete, onEdit }: ActorsProps) {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Reviewer Actions"
        description="Record warnings, incident reports, and sanctions for Reviewer violations."
        action={
          <button
            className="primary-button"
            type="button"
            onClick={onAdd}
          >
            Record Action
          </button>
        }
      />
      <div className="reviewer-content">
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id ?? action._id}>
                    <td>
                      <strong>{action.reviewerName}</strong>
                      <small>{action.reviewerEmail}</small>
                    </td>
                    <td>{action.type}</td>
                    <td>{action.severity}</td>
                    <td>{action.reason}</td>
                    <td>{action.status}</td>
                    <td>{new Date(action.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => onEdit(action)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(action)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {actions.length === 0 && (
            <div className="empty-state">
              <strong>No Reviewer actions recorded</strong>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
