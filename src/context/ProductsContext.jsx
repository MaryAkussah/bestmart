import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/apiClient'
import { products as seedProducts, categories } from '../data/products'

const ProductsContext = createContext(null)

/**
 * The single source of truth for "what's in the marketplace" — the static
 * demo catalog (always present, so Shop never renders empty) merged with
 * whatever real sellers have listed, via the Express API (server/routes/
 * products.js), which does the row<->camelCase mapping server-side now.
 */
export function ProductsProvider({ children }) {
  const [dbProducts, setDbProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.get('/products').then((result) => {
      if (active && result.ok) {
        setDbProducts(result.data)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const products = [...seedProducts, ...dbProducts]

  const addProduct = async (product) => {
    const result = await api.post('/products', product)
    if (!result.ok) return result

    setDbProducts((prev) => [...prev, result.data])
    return { ok: true }
  }

  const updateProduct = async (id, updates) => {
    const result = await api.patch(`/products/${id}`, updates)
    if (!result.ok) return result

    setDbProducts((prev) => prev.map((p) => (p.id === id ? result.data : p)))
    return { ok: true }
  }

  const deleteProduct = async (id) => {
    const result = await api.delete(`/products/${id}`)
    if (!result.ok) return result

    setDbProducts((prev) => prev.filter((p) => p.id !== id))
    return { ok: true }
  }

  const value = { products, categories, loading, addProduct, updateProduct, deleteProduct }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>')
  return ctx
}
