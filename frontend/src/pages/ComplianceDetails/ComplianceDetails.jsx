import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import {
  PriorityBadge,
  StatusBadge,
} from '../../views/components/Badge/Badge.jsx'
import { formatDueDate } from '../../models/complianceModel.js'
import { evidenceUrl } from '../../services/complianceService.js'
import './ComplianceDetails.css'

export function ComplianceDetails({
  canEdit = true,
  canReview = true,
  compliance,
  decision,
  comments,
  onDecision,
  onComments,
  onBack,
  onEdit,
  onOpenSubmission,
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
            {canEdit && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => onEdit(compliance.id)}
              >
                Edit
              </button>
            )}
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
                <h2>Compliance Form</h2>
                <p>Structured information submitted by the reporter.</p>
              </div>
            </div>
            {compliance.submission ? (
              <div className="evidence-content">
                <div className="file-tile">
                  <div>
                    <strong>{compliance.type} form</strong>
                    <small>Submitted by {compliance.reporter}</small>
                  </div>
                  <button
                    className="secondary-button compact"
                    type="button"
                    onClick={() => onOpenSubmission(compliance.id)}
                  >
                    View Form
                  </button>
                </div>
                {compliance.submission.evidence?.file && (
                  <div className="file-tile">
                    <div>
                      <strong>
                        {compliance.submission.evidence.file.filename}
                      </strong>
                      <small>Uploaded evidence</small>
                    </div>
                    <a
                      className="secondary-button compact"
                      href={evidenceUrl(
                        compliance.id,
                        compliance.submission.evidence.file.fileId,
                      )}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View File
                    </a>
                  </div>
                )}
                {compliance.submission.evidence?.reference && (
                  <div className="evidence-reference">
                    <strong>Evidence Reference or Link</strong>
                    {/^https?:\/\//i.test(
                      compliance.submission.evidence.reference,
                    ) ? (
                      <a
                        href={compliance.submission.evidence.reference}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {compliance.submission.evidence.reference}
                      </a>
                    ) : (
                      <p>{compliance.submission.evidence.reference}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <strong>Form not submitted</strong>
                <p>The reporter has not submitted the compliance form yet.</p>
              </div>
            )}
          </section>
        </div>
        {canReview && (
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
        )}
      </div>
    </>
  )
}
