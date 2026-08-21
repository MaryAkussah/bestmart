import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards every dashboard/authenticated route. Not logged in -> bounce to
 * /login (and remember where they were headed so we can send them back
 * after they log in). Logged in -> render the nested route via <Outlet />.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
