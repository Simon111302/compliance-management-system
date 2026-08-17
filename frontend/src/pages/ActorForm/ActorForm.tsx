import type { FormEvent } from 'react'
import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import {
  reviewerActionSeverities,
  reviewerActionStatuses,
  reviewerActionTypes,
} from '../../models/reviewer.model'
import type { ReviewerActionForm, User } from '../../types'
import './ActorForm.css'

interface ActorFormProps {
  editing: boolean
  form: ReviewerActionForm
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdate: (
    field: keyof ReviewerActionForm,
    value: ReviewerActionForm[keyof ReviewerActionForm],
  ) => void
  reviewers: User[]
}

export function ActorForm({
  editing,
  form,
  onCancel,
  onSubmit,
  onUpdate,
  reviewers,
}: ActorFormProps) {
  return (
    <>
      <PageHeader
        eyebrow="Reviewer accountability"
        title={editing ? 'Edit Reviewer Action' : 'Record Reviewer Action'}
      />
      <div className="reviewer-content narrow-content">
        <form
          className="panel admin-form"
          onSubmit={onSubmit}
        >
          <div className="form-grid">
            <label className="field field-wide">
              <span>Reviewer</span>
              <select
                required
                disabled={reviewers.length === 0}
                value={form.reviewerId}
                onChange={(event) => onUpdate('reviewerId', event.target.value)}
              >
                {reviewers.length === 0 && (
                  <option value="">No Reviewer accounts available</option>
                )}
                {reviewers.map((reviewer) => (
                  <option
                    key={reviewer._id ?? reviewer.id}
                    value={reviewer._id ?? reviewer.id}
                  >
                    {reviewer.name} ({reviewer.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Action Type</span>
              <select
                value={form.type}
                onChange={(event) => onUpdate('type', event.target.value)}
              >
                {reviewerActionTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Severity</span>
              <select
                value={form.severity}
                onChange={(event) => onUpdate('severity', event.target.value)}
              >
                {reviewerActionSeverities.map((severity) => (
                  <option key={severity}>{severity}</option>
                ))}
              </select>
            </label>
            <label className="field field-wide">
              <span>Violation Reason</span>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(event) => onUpdate('reason', event.target.value)}
                placeholder="Describe the violation or non-compliance"
              />
            </label>
            <label className="field field-wide">
              <span>Admin Notes</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => onUpdate('notes', event.target.value)}
                placeholder="Add investigation details or required corrective action"
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => onUpdate('status', event.target.value)}
              >
                {reviewerActionStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={reviewers.length === 0}
              type="submit"
            >
              {editing ? 'Save Changes' : 'Record Action'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
