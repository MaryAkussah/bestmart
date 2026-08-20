import { Link } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'

const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <HiOutlineShoppingBag className="text-violet-400" size={24} />
            Best<span className="text-violet-400">Mart</span>
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            Your everyday marketplace for quality products at unbeatable prices.
          </p>
          <div className="flex gap-3 mt-4">
            {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-violet-600 transition"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-violet-400 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-violet-400 transition">About</Link></li>
            <li><Link to="/contact" className="hover:text-violet-400 transition">Contact</Link></li>
            <li><Link to="/login" className="hover:text-violet-400 transition">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-violet-400 transition">Sign up</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-violet-400 transition">Shipping Info</a></li>
            <li><a href="#" className="hover:text-violet-400 transition">Returns</a></li>
            <li><a href="#" className="hover:text-violet-400 transition">FAQs</a></li>
            <li><a href="#" className="hover:text-violet-400 transition">Track Order</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <HiOutlineLocationMarker className="text-violet-400 shrink-0" size={18} />
              123 Market Street, Lagos, Nigeria
            </li>
            <li className="flex items-center gap-2">
              <HiOutlinePhone className="text-violet-400 shrink-0" size={18} />
              +234 800 123 4567
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineMail className="text-violet-400 shrink-0" size={18} />
              support@bestmart.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {year} BestMart. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
