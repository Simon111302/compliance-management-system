import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import {
  PriorityBadge,
  StatusBadge,
} from '../../views/components/Badge/Badge.jsx'
import { formatDueDate } from '../../models/complianceModel.js'
import './ComplianceList.css'

export function ComplianceList({
  compliances,
  search,
  statusFilter,
  statuses,
  onSearch,
  onStatusFilter,
  onCreate,
  onOpenDetails,
  onEdit,
}) {
  return (
    <>
      <PageHeader
        eyebrow="Reviewer workspace"
        title="Compliance"
        description="Create, review, and manage compliance records."
        action={
          <button
            className="primary-button"
            type="button"
            onClick={onCreate}
          >
            Create Compliance
          </button>
        }
      />
      <div className="reviewer-content">
        <section className="panel">
          <div className="list-tools">
            <label className="search-field">
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search by ID, name, or reporter"
              />
            </label>
            <label className="select-field">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => onStatusFilter(event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Compliance ID</th>
                  <th>Compliance</th>
                  <th>Reporter</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {compliances.map((compliance) => (
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
                    <td>{formatDueDate(compliance.dueDate, true)}</td>
                    <td>
                      <PriorityBadge priority={compliance.priority} />
                    </td>
                    <td>
                      <StatusBadge status={compliance.status} />
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          type="button"
                          onClick={() => onOpenDetails(compliance.id)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(compliance.id)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {compliances.length === 0 && (
            <div className="empty-state">
              <strong>No compliance records found</strong>
              <p>Try a different search or status.</p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
