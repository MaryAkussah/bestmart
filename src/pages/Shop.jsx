import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineSupport } from 'react-icons/hi'
import {
  HiOutlineArrowPath,
  HiOutlineArrowRight,
  HiStar,
  HiOutlineBolt,
  HiOutlineCheckBadge,
  HiOutlineTag,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
  HiOutlineDevicePhoneMobile,
  HiOutlineSwatch,
  HiOutlineHome,
  HiOutlineBeaker,
  HiOutlineTrophy,
} from 'react-icons/hi2'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { categoryImages } from '../data/categoryImages'
import { getPrimaryImage } from '../utils/productImages'

const trustBar = [
  { icon: HiOutlineCheckBadge, title: 'Premium Quality', text: 'Made with the finest materials' },
  { icon: HiOutlineTruck, title: 'Fast Delivery', text: 'Quick and reliable shipping' },
  { icon: HiOutlineShieldCheck, title: 'Secure Checkout', text: 'Your data is protected' },
  { icon: HiOutlineSupport, title: 'Customer Satisfaction', text: '100% satisfaction guarantee' },
]

const sidebarCategories = [
  { name: 'Groceries', icon: HiOutlineShoppingBag },
  { name: 'Electronics', icon: HiOutlineDevicePhoneMobile },
  { name: 'Fashion', icon: HiOutlineSwatch },
  { name: 'Home & Living', icon: HiOutlineHome },
  { name: 'Beauty', icon: HiOutlineBeaker },
  { name: 'Sports', icon: HiOutlineTrophy },
]

const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const SLIDE_INTERVAL_MS = 5000

function pad(n) {
  return String(n).padStart(2, '0')
}

function useCountdown(durationMs) {
  const [endTime] = useState(() => Date.now() + durationMs)
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const totalSeconds = Math.floor(remaining / 1000)
  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  }
}

// Auto-advances through `count` slides, pausing/resetting the timer
// whenever a slide is picked manually via the dot controls.
function useSlider(count, intervalMs) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs, index])

  return [index, setIndex]
}

function Shop() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category')

  const { products, categories } = useProducts()

  const [active, setActive] = useState(
    initialCategory && categories.includes(initialCategory) ? initialCategory : 'All'
  )
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const countdown = useCountdown(SIX_HOURS_MS)
  const [slideIndex, setSlideIndex] = useSlider(categories.length, SLIDE_INTERVAL_MS)

  // Arriving via a category or search deep-link (e.g. from the Navbar's
  // search) should land the shopper straight on the matching results.
  useEffect(() => {
    if (searchParams.get('category') || searchParams.get('q')) {
      scrollTo('products')
    }
    // Only ever meant to run once, against however the page was first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byCategory = active === 'All' ? products : products.filter((p) => p.category === active)
  const filtered = query.trim()
    ? byCategory.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : byCategory
  const bestSellers = products.filter((p) => p.bestSeller)
  const saleItems = products.filter((p) => p.oldPrice)

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleQuickAdd = (product) => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { from: location } })
      return
    }
    addToCart(product)
  }

  const handleHeroSearch = (e) => {
    e.preventDefault()
    scrollTo('products')
  }

  return (
    <div>
      {/* Hero with background image slider + search */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden bg-brand-navy">
        {categories.map((cat, i) => (
          <img
            key={cat}
            src={categoryImages[cat]}
            alt={cat}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === slideIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-brand-navy/80" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">What are you looking for?</h1>
          <p className="text-blue-100 mt-2 text-sm max-w-md mx-auto">
            Search thousands of products from trusted sellers across Ghana.
          </p>

          <form
            onSubmit={handleHeroSearch}
            className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-2xl mx-auto sm:bg-white sm:rounded-full sm:shadow-lg sm:overflow-hidden"
          >
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="rounded-full sm:rounded-none bg-white sm:border-r border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I am looking for..."
              className="flex-1 rounded-full sm:rounded-none bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-full sm:rounded-none bg-brand-orange hover:bg-brand-orange-dark text-white px-6 py-3 flex items-center justify-center transition"
            >
              <HiOutlineMagnifyingGlass size={20} />
            </button>
          </form>

          <div className="flex justify-center gap-2 mt-8">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setSlideIndex(i)}
                aria-label={`Show ${cat}`}
                className={`h-2 rounded-full transition-all ${
                  i === slideIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: HiOutlineTruck, title: 'Free Shipping', text: 'On orders over ₵200' },
            { icon: HiOutlineShieldCheck, title: 'Secure Payments', text: '100% secure checkout' },
            { icon: HiOutlineArrowPath, title: 'Easy Returns', text: '30-day return policy' },
            { icon: HiOutlineSupport, title: '24/7 Support', text: 'Always here to help' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Icon className="text-brand-blue" size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 truncate">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Categories</h2>
          <button
            onClick={() => setActive('All')}
            className="text-sm font-semibold text-brand-blue hover:underline shrink-0"
          >
            View All Categories
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActive(cat)
                scrollTo('products')
              }}
              className={`group text-left rounded-xl overflow-hidden border transition ${
                active === cat ? 'border-brand-blue shadow-md' : 'border-gray-200 hover:border-brand-blue-light hover:shadow-md'
              }`}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={categoryImages[cat]}
                  alt={cat}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="py-3 text-center">
                <span className="block text-sm font-medium text-gray-800">{cat}</span>
                <span className="text-xs text-brand-blue">Shop Now</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Product grid (sidebar-filterable + searchable) */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {query.trim() ? `Results for "${query.trim()}"` : active === 'All' ? 'All Products' : active}
            </h2>
            <p className="text-gray-600 mt-1">{filtered.length} products found</p>
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <HiOutlineMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <HiOutlineXMark size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              <button
                onClick={() => setActive('All')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition ${
                  active === 'All' ? 'bg-blue-50 text-brand-blue' : 'text-gray-800 hover:bg-blue-50'
                }`}
              >
                All Products
                <span className="text-xs text-gray-400">{products.length}</span>
              </button>
              {sidebarCategories.map(({ name, icon: Icon }) => {
                const count = products.filter((p) => p.category === name).length
                return (
                  <button
                    key={name}
                    onClick={() => setActive(name)}
                    className={`group w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                      active === name ? 'bg-blue-50' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon className="text-brand-blue" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${active === name ? 'text-brand-blue' : 'text-gray-800'}`}>
                        {name}
                      </p>
                      <p className="text-xs text-gray-400">{count} products</p>
                    </div>
                    <HiOutlineChevronRight
                      className={`shrink-0 transition ${active === name ? 'text-brand-blue' : 'text-gray-300 group-hover:text-brand-blue'}`}
                      size={16}
                    />
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0">
            {/* Mobile category chips — replaces the sidebar below lg */}
            <div className="flex flex-wrap gap-2 mb-8 lg:hidden">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    active === cat
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'text-gray-700 border-gray-200 hover:border-brand-blue-light'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500">No products match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Best Sellers</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
              >
                <img
                  src={getPrimaryImage(product)}
                  alt={product.category}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-1">
                    Bestseller
                  </span>
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <HiStar className="text-yellow-400" size={14} />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-400">· Sold by {product.seller}</span>
                  </div>
                  <p className="font-bold text-gray-900 mt-1">₵{product.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="shrink-0 text-xs font-medium bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-lg transition"
                >
                  Quick Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash sale + new collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-6">
        <div className="bg-brand-orange rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold mb-2">
            <HiOutlineBolt size={18} />
            Flash Sale
          </div>
          <h3 className="text-white text-2xl font-bold">Up To 30% Off</h3>
          <p className="text-orange-50 mt-1 text-sm">{saleItems.length} items on sale — while stock lasts.</p>

          <div className="flex gap-3 mt-6">
            {[
              ['Hours', countdown.hours],
              ['Minutes', countdown.minutes],
              ['Seconds', countdown.seconds],
            ].map(([label, value]) => (
              <div key={label} className="bg-white/15 rounded-lg px-4 py-2 text-center">
                <div className="text-white text-xl font-bold tabular-nums">{value}</div>
                <div className="text-orange-50 text-[10px] uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollTo('products')}
            className="mt-6 inline-flex items-center gap-2 bg-white text-brand-orange font-medium px-6 py-2.5 rounded-lg hover:bg-orange-50 transition"
          >
            Shop Sale Now
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden min-h-[220px]">
          <img
            src={categoryImages.Fashion}
            alt="New arrivals"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-navy/70" />
          <div className="relative h-full p-8 sm:p-10 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 text-blue-100 text-xs font-semibold mb-2">
              <HiOutlineTag size={16} />
              New Collection
            </span>
            <h3 className="text-white text-2xl font-bold">Fresh Styles Just Landed</h3>
            <p className="text-blue-100 mt-1 text-sm max-w-xs">
              Discover the newest arrivals across every category.
            </p>
            <button
              onClick={() => scrollTo('categories')}
              className="mt-6 inline-flex items-center gap-2 self-start bg-white text-brand-navy font-medium px-6 py-2.5 rounded-lg hover:bg-gray-100 transition"
            >
              Browse Categories
              <HiOutlineArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBar.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <Icon className="text-brand-blue shrink-0" size={22} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Shop
