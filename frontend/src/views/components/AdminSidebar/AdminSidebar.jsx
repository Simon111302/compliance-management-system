import './AdminSidebar.css'

const navigation = [
  ['admin-dashboard', 'Dashboard'],
  ['users', 'User Management'],
  ['reviewer-actions', 'Reviewer Actions'],
  ['admin-compliance', 'Compliance'],
  ['audit-logs', 'Audit Logs'],
  ['admin-settings', 'Settings'],
]

export function AdminSidebar({ activePage, onLogout, onNavigate, user }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="admin-sidebar">
      <button
        className="admin-brand"
        type="button"
        onClick={() => onNavigate('admin-dashboard')}
      >
        Compliance System
      </button>
      <p className="admin-sidebar-label">Admin workspace</p>
      <nav aria-label="Admin navigation">
        {navigation.map(([page, label]) => (
          <button
            key={page}
            className={activePage === page ? 'nav-item active' : 'nav-item'}
            type="button"
            onClick={() => onNavigate(page)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <button
        className="nav-item"
        type="button"
        onClick={onLogout}
      >
        Logout
      </button>
      <div className="reviewer-profile">
        <span className="avatar">{initials}</span>
        <span>
          <strong>{user.name}</strong>
          <small>{user.role}</small>
        </span>
      </div>
    </aside>
  )
}
