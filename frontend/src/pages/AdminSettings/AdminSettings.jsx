import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'

export function AdminSettings() {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="System settings will be managed here."
      />
      <div className="reviewer-content">
        <section className="panel admin-placeholder">
          <h2>System Settings</h2>
          <p>No configurable settings are available yet.</p>
        </section>
      </div>
    </>
  )
}
