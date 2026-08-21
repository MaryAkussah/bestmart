import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'
import logo from '../assets/logo.png'

const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center">
            <img src={logo} alt="BestMart" className="h-12 w-auto object-contain bg-white rounded-lg px-2 py-1" />
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            The marketplace where businesses publish, advertise and sell to everyday shoppers.
          </p>
          <div className="flex gap-3 mt-4">
            {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-orange transition"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand-orange-light transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-brand-orange-light transition">About</Link></li>
            <li><Link to="/contact" className="hover:text-brand-orange-light transition">Contact</Link></li>
            <li><Link to="/login" className="hover:text-brand-orange-light transition">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-brand-orange-light transition">Sign up</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-brand-orange-light transition">Shipping Info</a></li>
            <li><a href="#" className="hover:text-brand-orange-light transition">Returns</a></li>
            <li><a href="#" className="hover:text-brand-orange-light transition">FAQs</a></li>
            <li><a href="#" className="hover:text-brand-orange-light transition">Track Order</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <HiOutlineLocationMarker className="text-brand-orange-light shrink-0" size={18} />
              123 Oxford Street, Accra, Ghana
            </li>
            <li className="flex items-center gap-2">
              <HiOutlinePhone className="text-brand-orange-light shrink-0" size={18} />
              +233 30 123 4567
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineMail className="text-brand-orange-light shrink-0" size={18} />
              support@bestmart.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
        © {year} BestMart. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
