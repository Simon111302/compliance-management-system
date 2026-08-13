import { AppRoutes } from './routes/AppRoutes.jsx'
import { Sidebar } from './views/components/Sidebar/Sidebar.jsx'
import { useReviewerController } from './controllers/useReviewerController.js'

function App() {
  const controller = useReviewerController()

  return (
    <div className="app-shell">
      <Sidebar
        activePage={controller.page}
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
