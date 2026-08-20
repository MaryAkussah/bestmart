import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { HiOutlineShoppingBag } from 'react-icons/hi2'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-violet-600 ${
      isActive ? 'text-violet-600' : 'text-gray-700'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <HiOutlineShoppingBag className="text-violet-600" size={26} />
          Best<span className="text-violet-600">Mart</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 hover:text-violet-600 transition px-4 py-2"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 transition"
          >
            Sign up
          </Link>
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <HiX size={26} /> : <HiMenu size={26} />}
        </button>
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
                    isActive ? 'text-violet-600' : 'text-gray-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
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
              className="mt-2 text-center text-sm font-medium bg-violet-600 text-white px-5 py-2.5 rounded-lg"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
