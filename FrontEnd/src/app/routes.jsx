import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GoalNewPage from './pages/GoalNewPage'
import CalendarPage from './pages/CalendarPage'
import FeedbackPage from './pages/FeedbackPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/goal/new" element={<GoalNewPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

export default AppRoutes
