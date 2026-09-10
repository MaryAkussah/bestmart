import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards "logged in, any role" pages like /profile — unlike ProtectedRoute,
 * there's no isSeller requirement, since a buyer profile has to be reachable
 * by buyers who never become sellers.
 */
function AccountRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default AccountRoute
