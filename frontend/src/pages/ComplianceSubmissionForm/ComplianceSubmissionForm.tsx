import type {
  Compliance,
  SubmissionFieldDefinition,
  SubmissionForm,
  SubmissionFormDefinition,
  FormSubmitHandler,
} from '../../types'
import { submissionFormDefinitions } from '../../models/compliance.model'
import './ComplianceSubmissionForm.css'

interface FormControlProps {
  field: SubmissionFieldDefinition
  name: string
  value: string
  onChange: (value: string) => void
}

function FormControl({ field, name, value, onChange }: FormControlProps) {
  if (field.options) {
    return (
      <div className="choice-group">
        {field.options.map((option) => (
          <label key={option}>
            <input
              required={!field.optional}
              checked={value === option}
              name={name}
              type="radio"
              value={option}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        required={!field.optional}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  return (
    <input
      required={!field.optional}
      min={field.type === 'number' ? '0' : undefined}
      step={field.type === 'number' ? '0.01' : undefined}
      type={field.type ?? 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

interface ComplianceSubmissionFormProps {
  compliance: Compliance | null
  form: SubmissionForm | null
  submitting: boolean
  onBack: () => void
  onSubmit: FormSubmitHandler
  onUpdateDetails: (field: string, value: string) => void
  onUpdateEmployee: (field: string, value: string) => void
  onUpdateEvidence: (field: string, value: string) => void
  onUpdateEvidenceFile: (file: File | null) => void
  onUpdateRow: (rowIndex: number, field: string, value: string) => void
}

export function ComplianceSubmissionForm({
  compliance,
  form,
  submitting,
  onBack,
  onSubmit,
  onUpdateDetails,
  onUpdateEmployee,
  onUpdateEvidence,
  onUpdateEvidenceFile,
  onUpdateRow,
}: ComplianceSubmissionFormProps) {
  if (!compliance || !form) return null

  const definition: SubmissionFormDefinition =
    submissionFormDefinitions[compliance.type]
  if (!definition) return null

  return (
    <div className="reporter-submission-page">
      <div className="submission-heading">
        <div>
          <p className="eyebrow">{compliance.id}</p>
          <h1>{compliance.type}</h1>
          <p>
            {compliance.status === 'Partial' || compliance.status === 'Rejected'
              ? 'Update the returned form and resubmit it for review.'
              : 'Complete the assigned compliance form and submit it for review.'}
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      <form
        className="panel submission-form"
        onSubmit={onSubmit}
      >
        {(compliance.status === 'Partial' ||
          compliance.status === 'Rejected') && (
          <section
            className={`review-feedback-banner review-feedback-${compliance.status.toLowerCase()}`}
            role="status"
          >
            <div className="review-feedback-heading">
              <div>
                <p className="eyebrow">Reviewer Feedback</p>
                <h2>
                  {compliance.status === 'Partial'
                    ? 'Changes are required'
                    : 'Submission needs correction'}
                </h2>
              </div>
              <span className="review-feedback-status">
                {compliance.status}
              </span>
            </div>
            <div className="review-feedback-note">
              <strong>Reviewer note</strong>
              <p>{compliance.reviewerComments || 'No comments provided.'}</p>
            </div>
            <p className="review-feedback-reminder">
              Review the note, update the required fields and evidence, then
              resubmit the compliance for another review.
            </p>
          </section>
        )}
        <section className="submission-section">
          <h2>{definition.employeeTitle}</h2>
          <div className="submission-field-grid">
            {definition.employeeFields.map((field) => (
              <label
                className="field"
                key={field.key}
              >
                <span>{field.label}</span>
                <FormControl
                  field={field}
                  name={`employee-${field.key}`}
                  value={form.employeeInformation[field.key]}
                  onChange={(value) => onUpdateEmployee(field.key, value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="submission-section">
          <h2>{definition.sectionTitle}</h2>
          <div className="submission-table-wrap">
            <table className="submission-table">
              <thead>
                <tr>
                  <th>{definition.rowLabel}</th>
                  {definition.rowFields.map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.rows.map((row, rowIndex) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {definition.rowFields.map((field) => (
                      <td key={field.key}>
                        <div className={field.prefix ? 'prefixed-input' : ''}>
                          {field.prefix && <span>{field.prefix}</span>}
                          <FormControl
                            field={field}
                            name={`row-${rowIndex}-${field.key}`}
                            value={row[field.key]}
                            onChange={(value) =>
                              onUpdateRow(rowIndex, field.key, value)
                            }
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {definition.detailFields.length > 0 && (
          <section className="submission-section">
            <h2>{definition.detailsTitle ?? 'Additional Details'}</h2>
            <div className="submission-field-grid">
              {definition.detailFields.map((field) => (
                <label
                  className={
                    field.type === 'textarea' ? 'field field-wide' : 'field'
                  }
                  key={field.key}
                >
                  <span>{field.label}</span>
                  <FormControl
                    field={field}
                    name={`details-${field.key}`}
                    value={form.details[field.key]}
                    onChange={(value) => onUpdateDetails(field.key, value)}
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="submission-section evidence-section">
          <div>
            <h2>Evidence</h2>
            <p>Upload one file or provide an evidence reference/link.</p>
          </div>
          <div className="submission-field-grid evidence-field-grid">
            <label className="field">
              <span>Evidence File</span>
              <input
                accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
                type="file"
                onChange={(event) =>
                  onUpdateEvidenceFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
            <label className="field">
              <span>Evidence Reference or Link</span>
              <input
                maxLength={1000}
                placeholder="https://... or document reference"
                type="text"
                value={form.evidence.reference}
                onChange={(event) =>
                  onUpdateEvidence('reference', event.target.value)
                }
              />
            </label>
          </div>
          <div className="evidence-guidance">
            <small>PDF, JPG, PNG, WebP, or TXT. Maximum 10 MB.</small>
            {form.evidenceFile && (
              <strong>Selected: {form.evidenceFile.name}</strong>
            )}
          </div>
        </section>

        <div className="submission-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? 'Submitting...'
              : compliance.status === 'Partial' ||
                  compliance.status === 'Rejected'
                ? 'Resubmit Compliance'
                : 'Submit Compliance'}
          </button>
        </div>
      </form>
    </div>
  )
}
