import { Link } from 'react-router-dom'
import { HiOutlineTrash } from 'react-icons/hi'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import { categoryImages } from '../data/categoryImages'

function Cart() {
  const { items, removeFromCart, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-600 mt-2">Browse the shop and add something you like.</p>
        <Link to="/shop">
          <Button variant="accent" className="mt-6">Go to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img
              src={categoryImages[item.category]}
              alt={item.category}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">₵{item.price} each</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => updateQty(item.id, Number(e.target.value))}
              className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center"
            />
            <span className="font-semibold text-gray-900 w-16 text-right">₵{item.qty * item.price}</span>
            <button
              onClick={() => removeFromCart(item.id)}
              aria-label="Remove item"
              className="text-gray-400 hover:text-red-500 transition"
            >
              <HiOutlineTrash size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-100 p-6">
        <span className="text-gray-600">Total</span>
        <span className="text-2xl font-bold text-gray-900">₵{total}</span>
      </div>

      <Button variant="accent" className="w-full mt-4">Checkout</Button>
    </div>
  )
}

export default Cart
