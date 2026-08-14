import { submissionFormDefinitions } from '../../models/complianceSubmissionModel.js'
import './ComplianceSubmissionForm.css'

function FormControl({ field, name, value, onChange }) {
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
        rows="3"
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

export function ComplianceSubmissionForm({
  compliance,
  form,
  submitting,
  onBack,
  onSubmit,
  onUpdateDetails,
  onUpdateEmployee,
  onUpdateRow,
}) {
  const definition = submissionFormDefinitions[compliance.type]
  if (!definition || !form) return null

  return (
    <div className="reporter-submission-page">
      <div className="submission-heading">
        <div>
          <p className="eyebrow">{compliance.id}</p>
          <h1>{compliance.type}</h1>
          <p>Complete the assigned compliance form and submit it for review.</p>
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
            {submitting ? 'Submitting...' : 'Submit Compliance'}
          </button>
        </div>
      </form>
    </div>
  )
}
