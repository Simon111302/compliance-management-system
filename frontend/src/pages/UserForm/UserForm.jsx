import { PageHeader } from '../../views/components/PageHeader/PageHeader.jsx'
import { statusOptions, userRoles } from '../../models/adminModel.js'
import './UserForm.css'

export function UserForm({ editing, form, onCancel, onSubmit, onUpdate }) {
  return (
    <>
      <PageHeader
        eyebrow="User management"
        title={editing ? 'Edit User' : 'Add User'}
      />
      <div className="reviewer-content narrow-content">
        <form
          className="panel admin-form"
          onSubmit={onSubmit}
        >
          <div className="form-grid">
            <label className="field">
              <span>First Name</span>
              <input
                required
                value={form.firstName}
                onChange={(event) => onUpdate('firstName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Last Name</span>
              <input
                required
                value={form.lastName}
                onChange={(event) => onUpdate('lastName', event.target.value)}
              />
            </label>
            <label className="field field-wide">
              <span>Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => onUpdate('email', event.target.value)}
              />
            </label>
            {!editing && (
              <label className="field field-wide">
                <span>Password</span>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) => onUpdate('password', event.target.value)}
                />
              </label>
            )}
            <label className="field">
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) => onUpdate('role', event.target.value)}
              >
                {userRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            {editing && (
              <label className="field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => onUpdate('status', event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            )}
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
              {editing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
