import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

/**
 * Shared shell for every authenticated (seller dashboard) page. Anything
 * that should appear on ALL logged-in pages (sidebar nav, top bar, etc.)
 * belongs here — add it once and every child route gets it via <Outlet />.
 */
function AuthWrapper() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthWrapper
