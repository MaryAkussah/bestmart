import { HiOutlineUsers, HiOutlineGlobeAlt, HiOutlineSparkles, HiOutlineHeart } from 'react-icons/hi'

const values = [
  {
    icon: HiOutlineHeart,
    title: 'Customer First',
    text: 'Every decision we make starts with what is best for the people who shop with us.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Quality Always',
    text: 'We carefully vet every product and seller on our platform before it reaches you.',
  },
  {
    icon: HiOutlineGlobeAlt,
    title: 'Wide Reach',
    text: 'From local neighborhoods to nationwide delivery, we bring the market closer to you.',
  },
  {
    icon: HiOutlineUsers,
    title: 'Community Driven',
    text: 'We grow alongside the sellers and customers who make BestMart what it is.',
  },
]

const stats = [
  { value: '500K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products Listed' },
  { value: '2K+', label: 'Trusted Sellers' },
  { value: '50+', label: 'Cities Served' },
]

function About() {
  return (
    <div>
      <section className="bg-violet-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white">About BestMart</h1>
          <p className="mt-4 text-violet-100 text-lg">
            We're on a mission to make everyday shopping simple, affordable, and reliable for
            everyone — one order at a time.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              BestMart started with a simple idea: shopping for everyday essentials shouldn't be
              complicated or expensive. What began as a small local marketplace has grown into a
              trusted destination for thousands of customers looking for quality products at fair
              prices.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Today, we partner with thousands of sellers across the country to bring you
              groceries, electronics, fashion, and more — all backed by fast delivery and
              dependable customer support.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100"
              >
                <div className="text-2xl font-extrabold text-violet-600">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">What We Stand For</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-4">
                  <Icon className="text-violet-600" size={26} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
