import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { HiOutlineShoppingCart, HiOutlineMagnifyingGlass, HiOutlineMegaphone, HiOutlineUserCircle, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import logo from '../assets/logo.png'

const links = [
  { to: '/', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
  { to: '/help-center', label: 'Help Center' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, logout } = useAuth()
  const { count } = useCart()
  const hasUnreadMessages = useUnreadMessages()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-blue whitespace-nowrap ${
      isActive ? 'text-brand-blue' : 'text-gray-700'
    }`

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
    setOpen(false)
  }

  // /sell is the seller registration page — it handles signed-out visitors
  // (full account + business form) and signed-in buyers (business details
  // only) itself, and bounces existing sellers straight to the dashboard.
  const handleSellClick = () => {
    setOpen(false)
    navigate('/sell')
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="BestMart" className="h-10 w-auto object-contain" />
        </Link>

        <form onSubmit={handleSearch} className="hidden lg:block max-w-md w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, categories..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-navy hover:bg-brand-blue-dark text-white flex items-center justify-center transition"
            >
              <HiOutlineMagnifyingGlass size={16} />
            </button>
          </div>
        </form>

        <div className="hidden lg:flex items-center gap-6 shrink-0">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto">
          <Link to="/cart" className="relative p-2 text-gray-700 hover:text-brand-blue transition" aria-label="Cart">
            <HiOutlineShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <Link to="/messages" className="relative p-2 text-gray-700 hover:text-brand-blue transition" aria-label="Messages">
              <HiOutlineChatBubbleLeftRight size={22} />
              {hasUnreadMessages && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-orange border-2 border-white" />
              )}
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/profile" className="p-2 text-gray-700 hover:text-brand-blue transition" aria-label="My profile">
              <HiOutlineUserCircle size={22} />
            </Link>
          )}

          {isAuthenticated && user?.isSeller ? (
            <Link
              to="/dashboard"
              className="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-blue-dark transition whitespace-nowrap"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={handleSellClick}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-blue border border-brand-blue px-4 py-2 rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
            >
              <HiOutlineMegaphone size={16} />
              Sell
            </button>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-brand-blue transition px-4 py-2 whitespace-nowrap"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-brand-blue transition px-4 py-2 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-brand-orange text-white px-5 py-2.5 rounded-lg hover:bg-brand-orange-dark transition whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2 ml-auto">
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
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pb-4">
          <form onSubmit={handleSearch} className="pt-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories..."
                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center"
              >
                <HiOutlineMagnifyingGlass size={16} />
              </button>
            </div>
          </form>

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

            {isAuthenticated && (
              <Link
                to="/messages"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-700 border-b border-gray-100"
              >
                Messages
                {hasUnreadMessages && <span className="w-2 h-2 rounded-full bg-brand-orange" />}
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-gray-700 border-b border-gray-100"
              >
                My Profile
              </Link>
            )}

            {isAuthenticated && user?.isSeller ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 text-center text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={handleSellClick}
                className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-blue border border-brand-blue px-5 py-2.5 rounded-lg"
              >
                <HiOutlineMegaphone size={16} />
                Sell
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="py-2.5 text-sm font-medium text-gray-700 text-center"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-gray-700 text-center"
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
