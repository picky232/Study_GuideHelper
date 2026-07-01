import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GoalNewPage from './pages/GoalNewPage'
import GoalGeneratePage from './pages/GoalGeneratePage'
import CalendarPage from './pages/CalendarPage'
import FeedbackPage from './pages/FeedbackPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProtectedRoute from '../presentation/components/common/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goal/new"
        element={
          <ProtectedRoute>
            <GoalNewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goal/generate"
        element={
          <ProtectedRoute>
            <GoalGeneratePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
