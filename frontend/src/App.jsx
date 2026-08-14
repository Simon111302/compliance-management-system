import { AdminRoutes } from './routes/AdminRoutes.jsx'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { Login } from './pages/Login/Login.jsx'
import { AdminSidebar } from './views/components/AdminSidebar/AdminSidebar.jsx'
import { Sidebar } from './views/components/Sidebar/Sidebar.jsx'
import { useAdminController } from './controllers/useAdminController.js'
import { useAuthController } from './controllers/useAuthController.js'
import { useReviewerController } from './controllers/useReviewerController.js'

function App() {
  const auth = useAuthController()
  const authenticated = Boolean(auth.user)
  const isAdmin = auth.user?.role === 'Admin'
  const isReviewer = auth.user?.role === 'Reviewer'
  const isReporter = auth.user?.role === 'Reporter'
  const admin = useAdminController(authenticated && isAdmin)
  const reviewer = useReviewerController(
    authenticated && (isAdmin || isReviewer),
    isReviewer,
  )
  const reporter = useReviewerController(authenticated && isReporter, false)

  if (auth.checkingSession) {
    return <main className="login-page">Checking session...</main>
  }

  if (!auth.user) {
    return (
      <Login
        error={auth.error}
        onSubmit={auth.login}
        submitting={auth.submitting}
      />
    )
  }

  if (isAdmin) {
    return (
      <div className="app-shell">
        <AdminSidebar
          activePage={admin.page}
          onLogout={auth.logout}
          onNavigate={admin.navigate}
          user={auth.user}
        />
        <main className="reviewer-main">
          <AdminRoutes
            admin={admin}
            reviewer={reviewer}
          />
        </main>
        {admin.toast && <div className="toast">{admin.toast}</div>}
      </div>
    )
  }

  if (!isReviewer && !isReporter) {
    return (
      <main className="login-page">
        <div className="panel">
          <h1>Role unavailable</h1>
          <p>This account role is no longer supported.</p>
          <button
            className="primary-button"
            type="button"
            onClick={auth.logout}
          >
            Logout
          </button>
        </div>
      </main>
    )
  }

  const workspace = isReviewer ? reviewer : reporter

  return (
    <div className="app-shell">
      <Sidebar
        activePage={workspace.page}
        onLogout={auth.logout}
        onNavigate={workspace.navigate}
        user={auth.user}
      />
      <main className="reviewer-main">
        <AppRoutes
          controller={workspace}
          readOnly={isReporter}
          role={auth.user.role}
        />
      </main>
      {workspace.toast && <div className="toast">{workspace.toast}</div>}
    </div>
  )
}

export default App
