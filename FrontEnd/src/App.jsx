import AppRoutes from './app/routes'
import NavBar from './presentation/components/common/NavBar'

function App() {
  return (
    <div className="min-h-screen pb-14">
      <AppRoutes />
      <NavBar />
    </div>
  )
}

export default App
