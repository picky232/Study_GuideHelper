import AppRoutes from './app/routes'
import NavBar from './presentation/components/common/NavBar'
import { useAuth } from './presentation/hooks/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <div className={user ? 'min-h-screen pb-14' : 'min-h-screen'}>
      <AppRoutes />
      {user && <NavBar />}
    </div>
  )
}

export default App
