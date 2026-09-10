import { createContext, useContext, useState, useEffect } from 'react'
import { products as seedProducts, categories } from '../data/products'

const ProductsContext = createContext(null)
const STORAGE_KEY = 'bestmart_products'

/**
 * The single source of truth for "what's in the marketplace" — seeded from
 * the static demo catalog, then mutable from here on. A seller listing a
 * product from the dashboard calls addProduct() and it shows up on Shop/Home
 * immediately, the same as any of the seed products.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : seedProducts
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  const addProduct = (product) => {
    setProducts((prev) => {
      const nextId = prev.reduce((max, p) => Math.max(max, p.id), 0) + 1
      const created = { likes: 0, ...product, id: nextId }
      return [...prev, created]
    })
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const value = { products, categories, addProduct, updateProduct, deleteProduct }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>')
  return ctx
}
