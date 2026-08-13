import './Sidebar.css'

export function Sidebar({ activePage, onLogout, onNavigate }) {
  return (
    <aside className="reviewer-sidebar">
      <button
        className="reviewer-brand"
        type="button"
        onClick={() => onNavigate('dashboard')}
      >
        Compliance
      </button>
      <p className="sidebar-label">Reviewer workspace</p>
      <nav aria-label="Reviewer navigation">
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
            ['compliance', 'create', 'details'].includes(activePage)
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
        <span className="avatar">AR</span>
        <span>
          <strong>Alex Rivera</strong>
          <small>Reviewer</small>
        </span>
      </div>
    </aside>
  )
}
