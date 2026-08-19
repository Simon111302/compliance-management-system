import { useState } from 'react'
import type { AdminPage, AuthUser, NavigateHandler } from '../../../types'
import './AdminSidebar.css'

const navigation: Array<[AdminPage, string]> = [
  ['admin-dashboard', 'Dashboard'],
  ['users', 'User Management'],
  ['admin-compliance', 'Compliance'],
  ['audit-logs', 'Audit Logs'],
  ['admin-settings', 'Settings'],
]

interface AdminSidebarProps {
  activePage: AdminPage
  onLogout: () => void | Promise<void>
  onNavigate: NavigateHandler<AdminPage>
  user: AuthUser
}

export function AdminSidebar({
  activePage,
  onLogout,
  onNavigate,
  user,
}: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="admin-sidebar">
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
          className="admin-brand"
          type="button"
          onClick={() => {
            setMenuOpen(false)
            onNavigate('admin-dashboard')
          }}
        >
          Compliance System
        </button>
      </div>
      <div className={menuOpen ? 'sidebar-menu open' : 'sidebar-menu'}>
        <p className="admin-sidebar-label">Admin workspace</p>
        <nav aria-label="Admin navigation">
          {navigation.map(([page, label]) => (
            <button
              key={page}
              className={activePage === page ? 'nav-item active' : 'nav-item'}
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onNavigate(page)
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
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
