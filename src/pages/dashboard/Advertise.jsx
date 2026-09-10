import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineMegaphone,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineTrash,
  HiOutlineCube,
} from 'react-icons/hi2'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useProducts } from '../../context/ProductsContext'
import { useLocalStorageList } from '../../hooks/useLocalStorageList'

const DURATIONS = [7, 14, 30]

function Advertise() {
  const { products } = useProducts()
  const myProducts = products.filter((p) => p.sellerAdded)
  const [ads, setAds] = useLocalStorageList('bestmart_ads', [])

  const [productId, setProductId] = useState('')
  const [budget, setBudget] = useState('')
  const [duration, setDuration] = useState(DURATIONS[0])
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!productId) next.productId = 'Choose which product to advertise'
    if (!budget || Number(budget) <= 0) next.budget = 'Enter a valid budget'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const product = myProducts.find((p) => p.id === Number(productId))
    const ad = {
      id: Date.now(),
      productId: Number(productId),
      productName: product?.name || 'Product',
      budget: Number(budget),
      duration: Number(duration),
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    setAds((prev) => [ad, ...prev])
    setProductId('')
    setBudget('')
    setDuration(DURATIONS[0])
    setErrors({})
  }

  const toggleStatus = (id) => {
    setAds((prev) =>
      prev.map((ad) =>
        ad.id === id ? { ...ad, status: ad.status === 'active' ? 'paused' : 'active' } : ad
      )
    )
  }

  const removeAd = (id) => {
    setAds((prev) => prev.filter((ad) => ad.id !== id))
  }

  const activeCount = ads.filter((ad) => ad.status === 'active').length

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Advertise</h1>
      <p className="text-gray-600 mt-1">
        Promote your products to reach more shoppers. {activeCount} active {activeCount === 1 ? 'ad' : 'ads'}.
      </p>

      {myProducts.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <HiOutlineCube className="mx-auto text-gray-300" size={40} />
          <p className="text-gray-500 mt-3">You need to list a product before you can advertise it.</p>
          <Link to="/dashboard/products">
            <Button className="mt-5">Add a Product</Button>
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6 grid sm:grid-cols-3 gap-x-4 items-start"
        >
          <div className="mb-4">
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Product
            </label>
            <select
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.productId ? 'border-red-400' : 'border-gray-300'
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition`}
            >
              <option value="">Select a product</option>
              {myProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <p className="mt-1 text-sm text-red-500">{errors.productId}</p>}
          </div>

          <Input
            id="budget"
            label="Budget (₵)"
            type="number"
            min="1"
            placeholder="e.g. 100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            error={errors.budget}
          />

          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="accent" className="sm:col-span-3 justify-self-start">
            <HiOutlineMegaphone size={18} />
            Launch Ad
          </Button>
        </form>
      )}

      <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {ads.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-500">No ads yet. Launch your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center gap-4 p-4">
                <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                  <HiOutlineMegaphone className="text-brand-blue" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ad.productName}</p>
                  <p className="text-sm text-gray-500">
                    ₵{ad.budget} budget · {ad.duration} days
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
                    ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ad.status}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleStatus(ad.id)}
                    aria-label={ad.status === 'active' ? 'Pause ad' : 'Resume ad'}
                    className="p-2 text-gray-400 hover:text-brand-blue transition"
                  >
                    {ad.status === 'active' ? <HiOutlinePause size={18} /> : <HiOutlinePlay size={18} />}
                  </button>
                  <button
                    onClick={() => removeAd(ad.id)}
                    aria-label="Delete ad"
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Advertise
