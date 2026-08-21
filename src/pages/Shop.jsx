import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

function Shop() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? products : products.filter((p) => p.category === active)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
      <p className="text-gray-600 mt-1">Products from trusted sellers across Ghana.</p>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default Shop
