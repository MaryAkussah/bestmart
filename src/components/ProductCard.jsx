import { HiOutlineShoppingCart } from 'react-icons/hi2'
import { useCart } from '../context/CartContext'
import { categoryImages } from '../data/categoryImages'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-square overflow-hidden">
        <img
          src={categoryImages[product.category]}
          alt={product.category}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-brand-blue">{product.category}</span>
        <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">Sold by {product.seller}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">₵{product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 text-sm font-medium bg-brand-orange hover:bg-brand-orange-dark text-white px-3 py-2 rounded-lg transition"
          >
            <HiOutlineShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
