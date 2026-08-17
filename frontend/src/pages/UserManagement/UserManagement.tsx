import { PageHeader } from '../../views/components/PageHeader/PageHeader'
import { userRoles } from '../../models/user.model'
import type { User } from '../../types'
import './UserManagement.css'

interface UserManagementProps {
  onAdd: () => void
  onDelete: (user: User) => void
  onEdit: (user: User) => void
  onResetPassword: (user: User) => void
  onRoleFilter: (role: string) => void
  onSearch: (search: string) => void
  onToggleStatus: (user: User) => void
  roleFilter: string
  search: string
  users: User[]
}

export function UserManagement({
  onAdd,
  onDelete,
  onEdit,
  onResetPassword,
  onRoleFilter,
  onSearch,
  onToggleStatus,
  roleFilter,
  search,
  users,
}: UserManagementProps) {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="User Management"
        description="Manage reviewers and reporters."
        action={
          <button
            className="primary-button"
            type="button"
            onClick={onAdd}
          >
            Add User
          </button>
        }
      />
      <div className="reviewer-content">
        <section className="panel">
          <div className="list-tools">
            <label className="search-field">
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search users"
              />
            </label>
            <label className="select-field">
              <span>Role</span>
              <select
                value={roleFilter}
                onChange={(event) => onRoleFilter(event.target.value)}
              >
                <option>All</option>
                {userRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id ?? user._id}>
                    <td>{user.name ?? `${user.firstName} ${user.lastName}`}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status ?? 'Active'}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                        >
                          {user.status === 'Inactive'
                            ? 'Activate'
                            : 'Deactivate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onResetPassword(user)}
                        >
                          Reset Password
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
