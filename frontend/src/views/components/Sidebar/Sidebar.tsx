import type { AuthUser, NavigateHandler, ReviewerPage } from '../../../types'
import './Sidebar.css'

interface SidebarProps {
  activePage: ReviewerPage
  onLogout: () => void | Promise<void>
  onNavigate: NavigateHandler<ReviewerPage>
  user: AuthUser
}

export function Sidebar({
  activePage,
  onLogout,
  onNavigate,
  user,
}: SidebarProps) {
  const isReviewer = user.role === 'Reviewer'
  const workspace = isReviewer ? 'Reviewer workspace' : 'Reporter workspace'
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="reviewer-sidebar">
      <button
        className="reviewer-brand"
        type="button"
        onClick={() => onNavigate('dashboard')}
      >
        Compliance
      </button>
      <p className="sidebar-label">{workspace}</p>
      <nav aria-label={`${user.role} navigation`}>
        <button
          className={
            activePage === 'dashboard' ? 'nav-item active' : 'nav-item'
          }
          type="button"
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={
            ['compliance', 'create', 'details', 'submission'].includes(
              activePage,
            )
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={() => onNavigate('compliance')}
        >
          Compliance
        </button>
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-divider" />
      <button
        className="nav-item"
        type="button"
      >
        Settings
      </button>
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
