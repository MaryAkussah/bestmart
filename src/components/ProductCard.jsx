import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiStar, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { categoryImages } from '../data/categoryImages'
import { getProductImages } from '../utils/productImages'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [wishlisted, setWishlisted] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  const images = getProductImages(product)
  const hasGallery = images.length > 1
  const displayImage = images[activePhoto] || categoryImages[product.category]

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null

  // Only real sellers can be messaged — the static demo catalog has no
  // seller_id, and there's no point messaging yourself about your own listing.
  const canMessageSeller = product.sellerId && product.sellerId !== user?.id

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { from: location } })
      return
    }
    addToCart(product)
  }

  const handleMessageSeller = () => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { from: location } })
      return
    }
    navigate(
      `/messages?seller=${product.sellerId}&productId=${product.id}&productName=${encodeURIComponent(product.name)}`
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {(product.isNew || discount) && (
          <span
            className={`absolute top-2 left-2 text-[11px] font-semibold text-white px-2 py-1 rounded-md ${
              discount ? 'bg-brand-orange' : 'bg-brand-blue'
            }`}
          >
            {discount ? `-${discount}%` : 'New'}
          </span>
        )}

        <button
          onClick={() => setWishlisted((prev) => !prev)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition"
        >
          {wishlisted ? (
            <HiHeart className="text-brand-orange" size={16} />
          ) : (
            <HiOutlineHeart className="text-gray-500" size={16} />
          )}
        </button>

        {hasGallery && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setActivePhoto(index)
                }}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activePhoto ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-brand-blue">{product.category}</span>
        <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">Sold by {product.seller}</p>

        {product.rating && (
          <div className="flex items-center gap-1 mt-1.5">
            <HiStar className="text-yellow-400" size={14} />
            <span className="text-xs text-gray-600">{product.rating}</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900">₵{product.price}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">₵{product.oldPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {canMessageSeller && (
              <button
                onClick={handleMessageSeller}
                aria-label="Message seller"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-brand-blue hover:border-brand-blue transition"
              >
                <HiOutlineChatBubbleLeftRight size={16} />
              </button>
            )}
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white transition"
            >
              <HiOutlineShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
