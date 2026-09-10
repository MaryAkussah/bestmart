import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HiMenu, HiX, HiOutlineLogout } from 'react-icons/hi'
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineMegaphone,
  HiOutlineShoppingBag,
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import logo from '../assets/logo.png'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineSquares2X2, end: true },
  { to: '/dashboard/products', label: 'My Products', icon: HiOutlineCube },
  { to: '/dashboard/advertise', label: 'Advertise', icon: HiOutlineMegaphone },
  { to: '/dashboard/orders', label: 'Orders', icon: HiOutlineShoppingBag },
  { to: '/dashboard/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
  // Both live outside /dashboard's shop-management pages — a seller is
  // still a buyer too, with their own personal account and messages.
  { to: '/messages', label: 'Messages', icon: HiOutlineChatBubbleLeftRight },
  { to: '/profile', label: 'My Profile', icon: HiOutlineUserCircle },
]

function SidebarLinks({ onNavigate }) {
  const hasUnreadMessages = useUnreadMessages()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-brand-blue text-white'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={linkClass} onClick={onNavigate}>
          <Icon size={20} />
          {label}
          {to === '/messages' && hasUnreadMessages && (
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    // Deferred: logging out flips auth state while still on a route
    // ProtectedRoute guards, so it reacts first and redirects to /login —
    // an immediate navigate('/') here loses that race. Running this after
    // the current render settles lets it have the last word.
    setTimeout(() => navigate('/', { replace: true }), 0)
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between bg-brand-navy px-4 h-16">
        <img src={logo} alt="BestMart" className="h-9 w-auto object-contain bg-white rounded-md px-1.5 py-1" />
        <button
          className="text-white"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <HiX size={26} /> : <HiMenu size={26} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-72 bg-brand-navy h-full px-4 py-6 flex flex-col">
            <SidebarLinks onNavigate={() => setOpen(false)} />
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
            >
              <HiOutlineLogout size={20} />
              Log out
            </button>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 bg-brand-navy min-h-screen px-4 py-6">
        <div className="px-2 mb-8">
          <img src={logo} alt="BestMart" className="h-11 w-auto object-contain bg-white rounded-md px-2 py-1.5" />
        </div>

        <div className="px-2 mb-6 flex items-center gap-3">
          {user?.businessLogo && (
            <img
              src={user.businessLogo}
              alt="Business logo"
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.businessName || user?.name || 'Seller'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.businessName && user?.name ? user.name : user?.email}
            </p>
          </div>
        </div>

        <SidebarLinks />

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
        >
          <HiOutlineLogout size={20} />
          Log out
        </button>
      </aside>
    </>
  )
}

export default Sidebar
