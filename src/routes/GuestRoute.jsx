import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Opposite of ProtectedRoute: keeps logged-in users OUT of guest-only
 * pages like /login and /signup by bouncing them to the dashboard instead.
 */
function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default GuestRoute
