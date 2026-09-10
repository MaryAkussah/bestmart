import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUserCircle, HiOutlineShoppingBag } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getPrimaryImage } from '../utils/productImages'
import { ORDER_STATUS_STYLES, formatOrderDate, rowToLineItem } from '../utils/orderLineItems'

/**
 * Every account's personal profile — distinct from a seller's shop
 * (managed from Settings in the dashboard). A seller is still a buyer too,
 * so this page is reachable by any logged-in account and always shows
 * order history; only non-sellers can edit their details here, since
 * sellers already do that from dashboard Settings and having two editable
 * copies of the same fields would drift out of sync.
 */
function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true

    supabase
      .from('orders')
      .select('id, created_at, status, total, order_items(id, product_id, price, qty, snapshot)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        const shaped = (data ?? []).map((o) => ({
          id: o.id,
          createdAt: o.created_at,
          status: o.status,
          total: o.total,
          items: o.order_items.map(rowToLineItem),
        }))
        setOrders(shaped)
        setOrdersLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const result = await updateUser(form)
    setSubmitting(false)

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, form: result.error }))
      return
    }
    setSaved(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <HiOutlineUserCircle className="text-brand-blue" size={36} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-0.5">Manage your details and see your order history.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Your details
        </h2>

        {user?.isSeller ? (
          <div>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-gray-500">Full name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-gray-500">Phone number</p>
                  <p className="text-gray-900 font-medium">{user.phone}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You manage your account from your shop's{' '}
              <Link to="/dashboard/settings" className="text-brand-blue font-medium hover:underline">
                Settings
              </Link>{' '}
              in the dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
                {errors.form}
              </div>
            )}
            {saved && (
              <div className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-4 py-2.5">
                Your details have been saved.
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Input
                id="name"
                name="name"
                label="Full name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Phone number"
              placeholder="e.g. 024 123 4567"
              value={form.phone}
              onChange={handleChange}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Your orders
        </h2>

        {ordersLoading ? null : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <HiOutlineShoppingBag className="mx-auto text-gray-300" size={36} />
            <p className="text-gray-500 mt-3">No orders yet.</p>
            <Link to="/">
              <Button variant="accent" className="mt-4">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{String(order.id).slice(-6)}</p>
                    <p className="text-xs text-gray-500">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <img
                        src={getPrimaryImage(item)}
                        alt={item.category}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Sold by {item.seller} · Qty {item.qty}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">₵{item.qty * item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 mt-1 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-bold text-gray-900">₵{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
