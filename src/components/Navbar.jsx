import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { HiOutlineShoppingCart } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logo from '../assets/logo.png'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { count } = useCart()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-blue ${
      isActive ? 'text-brand-blue' : 'text-gray-700'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="BestMart" className="h-10 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/cart" className="relative p-2 text-gray-700 hover:text-brand-blue transition" aria-label="Cart">
            <HiOutlineShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-blue-dark transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-brand-blue transition px-4 py-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-brand-orange text-white px-5 py-2.5 rounded-lg hover:bg-brand-orange-dark transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Link to="/cart" className="relative p-2 text-gray-700" aria-label="Cart">
            <HiOutlineShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="text-gray-700"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <HiX size={26} /> : <HiMenu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 text-sm font-medium border-b border-gray-100 ${
                    isActive ? 'text-brand-blue' : 'text-gray-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 text-center text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-gray-700"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="mt-2 text-center text-sm font-medium bg-brand-orange text-white px-5 py-2.5 rounded-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
