import { submissionFormDefinitions } from '../../models/complianceSubmissionModel.js'
import { evidenceUrl } from '../../services/complianceService.js'
import './ComplianceSubmissionView.css'

function valueOrDash(value) {
  return value || '—'
}

export function ComplianceSubmissionView({ compliance, onBack }) {
  const definition = submissionFormDefinitions[compliance.type]
  const submission = compliance.submission

  if (!definition) return null

  return (
    <div className="submission-view-page">
      <div className="submission-heading">
        <div>
          <p className="eyebrow">{compliance.id}</p>
          <h1>{compliance.type}</h1>
          <p>Reporter compliance form</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      {!submission ? (
        <section className="panel empty-state submission-empty">
          <strong>Form not submitted</strong>
          <p>The assigned reporter has not submitted this form yet.</p>
        </section>
      ) : (
        <div className="panel submission-view">
          <section className="submission-section">
            <h2>{definition.employeeTitle}</h2>
            <dl className="submission-data-grid">
              {definition.employeeFields.map((field) => (
                <div key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>
                    {valueOrDash(submission.employeeInformation?.[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
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
                  {definition.rowLabels.map((label, index) => {
                    const row = submission.rows?.[index] ?? { label }

                    return (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        {definition.rowFields.map((field) => (
                          <td key={field.key}>
                            {field.prefix}
                            {valueOrDash(row[field.key])}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {definition.detailFields.length > 0 && (
            <section className="submission-section">
              <h2>{definition.detailsTitle ?? 'Additional Details'}</h2>
              <dl className="submission-data-grid">
                {definition.detailFields.map((field) => (
                  <div
                    className={field.type === 'textarea' ? 'data-wide' : ''}
                    key={field.key}
                  >
                    <dt>{field.label}</dt>
                    <dd>{valueOrDash(submission.details?.[field.key])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="submission-section">
            <h2>Evidence</h2>
            <dl className="submission-data-grid">
              <div>
                <dt>Reference or Link</dt>
                <dd>
                  {submission.evidence?.reference ? (
                    /^https?:\/\//i.test(submission.evidence.reference) ? (
                      <a
                        href={submission.evidence.reference}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {submission.evidence.reference}
                      </a>
                    ) : (
                      submission.evidence.reference
                    )
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Uploaded File</dt>
                <dd>
                  {submission.evidence?.file ? (
                    <a
                      href={evidenceUrl(
                        compliance.id,
                        submission.evidence.file.fileId,
                      )}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {submission.evidence.file.filename}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  )
}
