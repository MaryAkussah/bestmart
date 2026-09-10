import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards every dashboard route. Not logged in -> bounce to /login. Logged
 * in but not yet a seller -> bounce to /sell (the one-click "become a
 * seller" opt-in) — the dashboard only exists for accounts that have taken
 * that step. Either way we remember where they were headed so they land
 * back there afterwards.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user?.isSeller) {
    return <Navigate to="/sell" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
