import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Opposite of ProtectedRoute: keeps logged-in users OUT of guest-only
 * pages like /login and /signup by bouncing them elsewhere instead.
 *
 * Login/Signup call login() then navigate(from) in the same handler — React
 * batches that auth-state update with this component's re-render, so this
 * guard can fire before their own navigate() commits. Its fallback ('/')
 * has to match theirs exactly: whichever redirect wins that race, it must
 * land in the same place, or the fallback used here silently overrides the
 * one the page itself intended.
 */
function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default GuestRoute
