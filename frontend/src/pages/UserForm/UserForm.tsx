import type { FormEvent } from 'react'
import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import { statusOptions, userRoles } from '../../models/user.model'
import type { UserForm as UserFormData } from '../../types'
import './UserForm.css'

interface UserFormProps {
  editing: boolean
  form: UserFormData
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdate: (
    field: keyof UserFormData,
    value: UserFormData[keyof UserFormData],
  ) => void
}

export function UserForm({
  editing,
  form,
  onCancel,
  onSubmit,
  onUpdate,
}: UserFormProps) {
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
