import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
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
      <div className="mobile-sidebar-header">
        <button
          className="sidebar-menu-toggle"
          type="button"
          aria-label={
            menuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <button
          className="reviewer-brand"
          type="button"
          onClick={() => {
            setMenuOpen(false)
            onNavigate('dashboard')
          }}
        >
          Compliance
        </button>
      </div>
      <div className={menuOpen ? 'sidebar-menu open' : 'sidebar-menu'}>
        <p className="sidebar-label">{workspace}</p>
        <nav aria-label={`${user.role} navigation`}>
          <button
            className={
              activePage === 'dashboard' ? 'nav-item active' : 'nav-item'
            }
            type="button"
            onClick={() => {
              setMenuOpen(false)
              onNavigate('dashboard')
            }}
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
            onClick={() => {
              setMenuOpen(false)
              onNavigate('compliance')
            }}
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
          onClick={() => {
            setMenuOpen(false)
            void onLogout()
          }}
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
      </div>
    </aside>
  )
}
