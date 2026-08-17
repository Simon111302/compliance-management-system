import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminRoutes } from './routes/AdminRoutes'
import { AppRoutes } from './routes/AppRoutes'
import { Login } from './pages/Login/Login'
import { AdminSidebar } from './views/components/AdminSidebar/AdminSidebar'
import { Sidebar } from './views/components/Sidebar/Sidebar'
import { useAdminController } from './controllers/useAdminController'
import { useAuthController } from './controllers/useAuthController'
import { useReporterController } from './controllers/useReporterController'
import { useReviewerController } from './controllers/useReviewerController'
import {
  getAdminCompliancePath,
  getAdminComplianceRoute,
  getAdminPath,
  getAdminRoute,
  getWorkspacePath,
  getWorkspaceRoute,
} from './routes/routePaths'

function App() {
  const location = useLocation()
  const navigateTo = useNavigate()
  const auth = useAuthController()
  const authenticated = Boolean(auth.user)
  const isAdmin = auth.user?.role === 'Admin'
  const isReviewer = auth.user?.role === 'Reviewer'
  const isReporter = auth.user?.role === 'Reporter'
  const admin = useAdminController(
    authenticated && isAdmin,
    (page, resourceId) => {
      navigateTo(getAdminPath(page, resourceId))
    },
  )
  const reviewer = useReviewerController(
    authenticated && (isAdmin || isReviewer),
    isReviewer,
    (page, resourceId) => {
      navigateTo(
        isAdmin
          ? getAdminCompliancePath(page, resourceId)
          : getWorkspacePath(page, 'Reviewer', resourceId),
      )
    },
  )
  const reporter = useReporterController(
    authenticated && isReporter,
    (page, resourceId) => {
      navigateTo(getWorkspacePath(page, 'Reporter', resourceId))
    },
  )

  const adminSyncPage = admin.syncPage
  const reviewerSyncPage = reviewer.syncPage
  const reporterSyncPage = reporter.syncPage

  useEffect(() => {
    if (auth.checkingSession) return

    if (!auth.user) {
      if (location.pathname !== '/login')
        navigateTo('/login', { replace: true })
      return
    }

    if (isAdmin) {
      if (!location.pathname.startsWith('/admin')) {
        navigateTo(getAdminPath('admin-dashboard'), { replace: true })
        return
      }

      const adminRoute = getAdminRoute(location.pathname)
      adminSyncPage(adminRoute.page, adminRoute.resourceId)
      if (adminRoute.page === 'admin-compliance') {
        const complianceRoute = getAdminComplianceRoute(location.pathname)
        reviewerSyncPage(complianceRoute.page, complianceRoute.resourceId)
      }
      return
    }

    if (isReviewer || isReporter) {
      const role = isReporter ? 'Reporter' : 'Reviewer'
      const prefix = isReporter ? '/reporter' : '/reviewer'
      if (!location.pathname.startsWith(prefix)) {
        navigateTo(getWorkspacePath('dashboard', role), { replace: true })
        return
      }

      const route = getWorkspaceRoute(location.pathname, role)
      const syncWorkspacePage = isReporter ? reporterSyncPage : reviewerSyncPage
      syncWorkspacePage(route.page, route.resourceId)
    }
  }, [
    adminSyncPage,
    auth.checkingSession,
    auth.user,
    isAdmin,
    isReporter,
    isReviewer,
    location.pathname,
    navigateTo,
    reporterSyncPage,
    reviewerSyncPage,
  ])

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
