import { Link } from 'react-router-dom'
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineTag, HiOutlineSupport } from 'react-icons/hi'
import heroImg from '../assets/logo-glow.png'
import Button from '../components/ui/Button'
import { categoryImages } from '../data/categoryImages'

const features = [
  {
    icon: HiOutlineTruck,
    title: 'Fast Delivery',
    text: 'Get your orders delivered to your doorstep in record time.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Secure Payments',
    text: 'Shop with confidence using our encrypted checkout.',
  },
  {
    icon: HiOutlineTag,
    title: 'Best Prices',
    text: 'Quality products at prices that beat the competition.',
  },
  {
    icon: HiOutlineSupport,
    title: '24/7 Support',
    text: 'Our team is always here to help with any questions.',
  },
]

const categories = ['Groceries', 'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports']

function Home() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold mb-4">
            Publish · Advertise · Sell
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Everything you need, <span className="text-brand-orange">delivered best.</span>
          </h1>
          <p className="mt-5 text-gray-600 text-lg max-w-lg">
            Discover thousands of quality products across groceries, electronics, fashion and
            more — all in one marketplace built for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop">
              <Button variant="accent" className="px-8 py-3 text-base">Shop Now</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="px-8 py-3 text-base">
                Sell on BestMart
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src={heroImg}
            alt="BestMart — Publish, Advertise, Sell"
            className="w-full max-w-md rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="text-brand-blue" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Shop by Category
        </h2>
        <p className="text-gray-600 text-center mt-2 max-w-xl mx-auto">
          Browse our most popular categories and find exactly what you're looking for.
        </p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/shop"
              className="group rounded-xl overflow-hidden border border-gray-200 hover:border-brand-blue-light hover:shadow-md transition cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={categoryImages[cat]}
                  alt={cat}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <span className="block text-sm font-medium text-gray-800 text-center py-3">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to publish, advertise and sell?
          </h2>
          <p className="text-blue-100 mt-2 max-w-xl mx-auto">
            Create a free seller account today and put your business in front of thousands of
            shoppers on BestMart.
          </p>
          <Link to="/signup">
            <Button variant="accent" className="mt-8 px-8 py-3 text-base">
              Create your account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
