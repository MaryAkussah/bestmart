import Shop from '../pages/Shop'
import Cart from '../pages/Cart'
import About from '../pages/About'
import Contact from '../pages/Contact'
import HelpCenter from '../pages/HelpCenter'
import SellerSignup from '../pages/SellerSignup'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Dashboard from '../pages/dashboard/Dashboard'
import Products from '../pages/dashboard/Products'
import Advertise from '../pages/dashboard/Advertise'
import Orders from '../pages/dashboard/Orders'
import Settings from '../pages/dashboard/Settings'

/**
 * Every public page lives here. Open to anyone, logged in or not.
 * Add a page? Add one line here — AppRoutes turns this into real
 * <Route> elements with a single .map(), no other file needs to change.
 */
export const publicRoutes = [
  { path: '/', element: Shop },
  { path: '/cart', element: Cart },
  { path: '/about', element: About },
  { path: '/contact', element: Contact },
  { path: '/help-center', element: HelpCenter },
  { path: '/sell', element: SellerSignup },
]

/**
 * Guest-only pages: rendered only when NOT logged in. Someone who is
 * already logged in gets redirected away from these (see GuestRoute).
 */
export const guestRoutes = [
  { path: '/login', element: Login },
  { path: '/signup', element: Signup },
  { path: '/forgot-password', element: ForgotPassword },
  { path: '/reset-password', element: ResetPassword },
]

/**
 * Everything here requires a logged-in user (seller dashboard area).
 * ProtectedRoute checks auth status before any of these ever render.
 */
export const privateRoutes = [
  { path: '/dashboard', element: Dashboard },
  { path: '/dashboard/products', element: Products },
  { path: '/dashboard/advertise', element: Advertise },
  { path: '/dashboard/orders', element: Orders },
  { path: '/dashboard/settings', element: Settings },
]
