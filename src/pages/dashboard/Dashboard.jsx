import { HiOutlineCube, HiOutlineMegaphone, HiOutlineShoppingBag, HiOutlineCurrencyDollar } from 'react-icons/hi2'
import { useAuth } from '../../context/AuthContext'

const stats = [
  { icon: HiOutlineCube, label: 'Products Listed', value: '0' },
  { icon: HiOutlineMegaphone, label: 'Active Ads', value: '0' },
  { icon: HiOutlineShoppingBag, label: 'Orders', value: '0' },
  { icon: HiOutlineCurrencyDollar, label: 'Revenue', value: '₵0' },
]

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back{user?.name ? `, ${user.name}` : ''} 👋
      </h1>
      <p className="text-gray-600 mt-1">
        Here's what's happening with your store today.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Icon className="text-brand-blue" size={22} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-brand-navy rounded-2xl p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Ready to reach more customers?</h2>
          <p className="text-blue-100 mt-1">List your first product or launch an ad to get started.</p>
        </div>
        <button className="mt-5 sm:mt-0 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium px-6 py-3 rounded-lg transition">
          Add a Product
        </button>
      </div>
    </div>
  )
}

export default Dashboard
