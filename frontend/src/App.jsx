import { AppRoutes } from './routes/AppRoutes.jsx'
import { Login } from './pages/Login/Login.jsx'
import { Sidebar } from './views/components/Sidebar/Sidebar.jsx'
import { useAuthController } from './controllers/useAuthController.js'
import { useReviewerController } from './controllers/useReviewerController.js'

function App() {
  const auth = useAuthController()
  const controller = useReviewerController(Boolean(auth.user))

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

  return (
    <div className="app-shell">
      <Sidebar
        activePage={controller.page}
        onLogout={auth.logout}
        onNavigate={controller.navigate}
      />
      <main className="reviewer-main">
        <AppRoutes controller={controller} />
      </main>
      {controller.toast && <div className="toast">{controller.toast}</div>}
    </div>
  )
}

export default App
