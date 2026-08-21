import { Routes, Route } from 'react-router-dom'
import UnauthWrapper from '../layouts/UnauthWrapper'
import AuthWrapper from '../layouts/AuthWrapper'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import NotFound from '../pages/NotFound'
import { publicRoutes, guestRoutes, privateRoutes } from './routesConfig'

/**
 * The single source of truth for "what renders where". Three groups,
 * each wrapped in its own condition + shared layout:
 *
 *   publicRoutes  -> anyone            -> UnauthWrapper (navbar + footer)
 *   guestRoutes   -> only logged OUT   -> UnauthWrapper, guarded by GuestRoute
 *   privateRoutes -> only logged IN    -> AuthWrapper (sidebar), guarded by ProtectedRoute
 *
 * Each group is just an array turned into <Route> elements with .map() —
 * to add a page, edit routesConfig.js, never this file.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<UnauthWrapper />}>
        {publicRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}

        <Route element={<GuestRoute />}>
          {guestRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthWrapper />}>
          {privateRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
