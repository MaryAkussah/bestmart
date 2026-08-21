import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HiMenu, HiX, HiOutlineLogout } from 'react-icons/hi'
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineMegaphone,
  HiOutlineShoppingBag,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineSquares2X2, end: true },
  { to: '/dashboard/products', label: 'My Products', icon: HiOutlineCube },
  { to: '/dashboard/advertise', label: 'Advertise', icon: HiOutlineMegaphone },
  { to: '/dashboard/orders', label: 'Orders', icon: HiOutlineShoppingBag },
  { to: '/dashboard/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

function SidebarLinks({ onNavigate }) {
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
        </NavLink>
      ))}
    </nav>
  )
}

function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
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

        <div className="px-2 mb-6">
          <p className="text-sm font-semibold text-white truncate">{user?.name || 'Seller'}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
