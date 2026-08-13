import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import {
  PriorityBadge,
  StatusBadge,
} from '../../views/components/Badge/Badge.jsx'
import { formatDueDate } from '../../models/complianceModel.js'
import './ComplianceDetails.css'

export function ComplianceDetails({
  compliance,
  decision,
  comments,
  onDecision,
  onComments,
  onBack,
  onEdit,
  onSubmitReview,
}) {
  if (!compliance) return null

  return (
    <>
      <PageHeader
        eyebrow="Compliance review"
        title="Compliance Details"
        action={
          <div className="header-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onBack}
            >
              Back
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onEdit(compliance.id)}
            >
              Edit
            </button>
          </div>
        }
      />
      <div className="reviewer-content details-layout">
        <div className="details-main">
          <section className="panel detail-card">
            <div className="detail-card-heading">
              <div>
                <span className="record-id">{compliance.id}</span>
                <h2>{compliance.name}</h2>
                <p>{compliance.type}</p>
              </div>
              <StatusBadge status={compliance.status} />
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Reporter</dt>
                <dd>{compliance.reporter}</dd>
              </div>
              <div>
                <dt>Due Date</dt>
                <dd>{formatDueDate(compliance.dueDate)}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <PriorityBadge priority={compliance.priority} />
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{compliance.status}</dd>
              </div>
              <div className="detail-wide">
                <dt>Notes</dt>
                <dd>{compliance.notes || 'No notes provided.'}</dd>
              </div>
            </dl>
          </section>
          <section className="panel evidence-card">
            <div className="panel-heading">
              <div>
                <h2>Evidence</h2>
                <p>Files and remarks submitted by the reporter.</p>
              </div>
            </div>
            {compliance.evidence ? (
              <div className="evidence-content">
                <div className="file-tile">
                  <div>
                    <strong>{compliance.evidence.fileName}</strong>
                    <small>Submitted by {compliance.reporter}</small>
                  </div>
                  <button
                    className="secondary-button compact"
                    type="button"
                  >
                    View File
                  </button>
                </div>
                <div className="remarks">
                  <span>Reporter Remarks</span>
                  <p>{compliance.evidence.remarks}</p>
                </div>
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <strong>Evidence not submitted</strong>
                <p>The reporter has not attached evidence yet.</p>
              </div>
            )}
          </section>
        </div>
        <form
          className="panel review-card"
          onSubmit={onSubmitReview}
        >
          <div>
            <p className="eyebrow">Reviewer decision</p>
            <h2>Review</h2>
            <p>Select a decision after checking the submitted evidence.</p>
          </div>
          <fieldset>
            <legend>Decision</legend>
            <div className="decision-options">
              {['Approve', 'Partial', 'Reject'].map((item) => (
                <button
                  key={item}
                  className={`decision-button decision-${item.toLowerCase()} ${decision === item ? 'selected' : ''}`}
                  type="button"
                  onClick={() => onDecision(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Reviewer Comments</span>
            <textarea
              rows="6"
              value={comments}
              onChange={(event) => onComments(event.target.value)}
              placeholder="Add feedback or explain the decision"
            />
          </label>
          <button
            className="primary-button full-button"
            type="submit"
            disabled={!decision}
          >
            Submit Review
          </button>
        </form>
      </div>
    </>
  )
}
