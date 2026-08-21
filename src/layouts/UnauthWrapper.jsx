import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * Shared shell for every public (unauthenticated) page: Home, About,
 * Contact, Login, Signup. Anything that should appear on ALL of these
 * pages (navbar, footer, promo banners, etc.) belongs here — add it once
 * and every child route gets it for free via <Outlet />.
 */
function UnauthWrapper() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UnauthWrapper
