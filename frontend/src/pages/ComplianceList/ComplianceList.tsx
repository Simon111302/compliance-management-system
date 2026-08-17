import type { Compliance } from '../../types'
import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import { PriorityBadge, StatusBadge } from '../../views/components/Badge/Badge'
import { formatDueDate } from '../../models/compliance.model'
import './ComplianceList.css'

interface ComplianceListProps {
  canCreate?: boolean
  canEdit?: boolean
  compliances: readonly Compliance[]
  eyebrow?: string
  description?: string
  search: string
  statusFilter: string
  statuses: readonly string[]
  onSearch: (search: string) => void
  onStatusFilter: (status: string) => void
  onCreate: () => void
  onOpenDetails: (complianceId: string) => void
  onOpenSubmission: (complianceId: string) => void
  onEdit: (complianceId: string) => void
}

export function ComplianceList({
  canCreate = true,
  canEdit = true,
  compliances,
  eyebrow = 'Reviewer workspace',
  description = 'Create, review, and manage compliance records.',
  search,
  statusFilter,
  statuses,
  onSearch,
  onStatusFilter,
  onCreate,
  onOpenDetails,
  onOpenSubmission,
  onEdit,
}: ComplianceListProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title="Compliance"
        description={description}
        action={
          canCreate ? (
            <button
              className="primary-button"
              type="button"
              onClick={onCreate}
            >
              Create Compliance
            </button>
          ) : null
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
                      <button
                        className="compliance-name-link"
                        type="button"
                        onClick={() => onOpenSubmission(compliance.id)}
                      >
                        <strong>{compliance.name}</strong>
                        <small>{compliance.type}</small>
                      </button>
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
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(compliance.id)}
                          >
                            Edit
                          </button>
                        )}
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
