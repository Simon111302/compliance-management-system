import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import './ComplianceForm.css'

export function ComplianceForm({
  editing,
  form,
  types,
  reporters,
  priorities,
  statuses,
  onUpdate,
  onCancel,
  onSubmit,
}) {
  return (
    <>
      <PageHeader
        eyebrow="Compliance management"
        title={editing ? 'Edit Compliance' : 'Create Compliance'}
        description={
          editing
            ? 'Update the compliance assignment and status.'
            : 'Assign a new compliance item to a reporter.'
        }
      />
      <div className="reviewer-content narrow-content">
        <form
          className="panel compliance-form"
          onSubmit={onSubmit}
        >
          <div className="form-grid">
            <label className="field field-wide">
              <span>Compliance Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => onUpdate('name', event.target.value)}
                placeholder="Enter compliance name"
              />
            </label>
            <label className="field">
              <span>Compliance Type</span>
              <select
                value={form.type}
                onChange={(event) => onUpdate('type', event.target.value)}
              >
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Reporter</span>
              <select
                value={form.reporter}
                onChange={(event) => onUpdate('reporter', event.target.value)}
              >
                {reporters.map((reporter) => (
                  <option key={reporter}>{reporter}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Due Date</span>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(event) => onUpdate('dueDate', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(event) => onUpdate('priority', event.target.value)}
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label className="field field-wide">
              <span>Notes</span>
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => onUpdate('notes', event.target.value)}
                placeholder="Add instructions or context for the reporter"
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => onUpdate('status', event.target.value)}
              >
                {statuses
                  .filter((status) => status !== 'All')
                  .map((status) => (
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
              type="submit"
            >
              {editing ? 'Save Changes' : 'Create Compliance'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
