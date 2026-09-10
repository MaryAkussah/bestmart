import { HiOutlineShoppingBag } from 'react-icons/hi2'
import { useLocalStorageList } from '../../hooks/useLocalStorageList'
import { getPrimaryImage } from '../../utils/productImages'

const STATUS_FLOW = ['Processing', 'Shipped', 'Delivered']

const STATUS_STYLES = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Orders() {
  const [orders, setOrders] = useLocalStorageList('bestmart_orders', [])

  const advanceStatus = (id) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        const nextIndex = STATUS_FLOW.indexOf(order.status) + 1
        if (nextIndex >= STATUS_FLOW.length) return order
        return { ...order, status: STATUS_FLOW[nextIndex] }
      })
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="text-gray-600 mt-1">
        {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed through your store.
      </p>

      {orders.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <HiOutlineShoppingBag className="mx-auto text-gray-300" size={40} />
          <p className="text-gray-500 mt-3">
            No orders yet. Orders placed at checkout will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Order #{String(order.id).slice(-6)}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
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
                      <p className="text-xs text-gray-500">Qty {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">₵{item.qty * item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 mt-1 border-t border-gray-100">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-gray-900">₵{order.total}</span>
              </div>

              {order.status !== 'Delivered' && (
                <button
                  onClick={() => advanceStatus(order.id)}
                  className="mt-4 text-sm font-medium text-brand-blue hover:underline"
                >
                  Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
