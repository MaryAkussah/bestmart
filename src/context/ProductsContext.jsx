import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { products as seedProducts, categories } from '../data/products'

const ProductsContext = createContext(null)

// products table (snake_case) <-> app product object (camelCase). Every row
// that comes from the database was, by construction, added by a seller —
// sellerAdded:true lets every existing `.filter(p => p.sellerAdded)` call
// site (dashboard Products/Advertise/Dashboard) keep working unchanged,
// same as the static seed products always having it unset/false.
function rowToProduct(row) {
  return {
    id: row.id,
    sellerId: row.seller_id,
    seller: row.seller,
    sellerAdded: true,
    name: row.name,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    images: row.images ?? [],
    rating: row.rating ?? undefined,
    isNew: row.is_new,
    bestSeller: row.best_seller,
  }
}

function productToRow(product) {
  const row = {}
  if (product.seller !== undefined) row.seller = product.seller
  if (product.name !== undefined) row.name = product.name
  if (product.category !== undefined) row.category = product.category
  if (product.price !== undefined) row.price = product.price
  if ('oldPrice' in product) row.old_price = product.oldPrice ?? null
  if (product.images !== undefined) row.images = product.images
  if (product.rating !== undefined) row.rating = product.rating
  if (product.isNew !== undefined) row.is_new = product.isNew
  if (product.bestSeller !== undefined) row.best_seller = product.bestSeller
  return row
}

/**
 * The single source of truth for "what's in the marketplace" — the static
 * demo catalog (always present, so Shop never renders empty) merged with
 * whatever real sellers have listed via Supabase.
 */
export function ProductsProvider({ children }) {
  const { user } = useAuth()
  const [dbProducts, setDbProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        if (active) {
          setDbProducts((data ?? []).map(rowToProduct))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const products = [...seedProducts, ...dbProducts]

  const addProduct = async (product) => {
    if (!user) return { ok: false, error: 'Not signed in' }

    const { data, error } = await supabase
      .from('products')
      .insert({ ...productToRow(product), seller_id: user.id })
      .select()
      .single()
    if (error) return { ok: false, error: error.message }

    setDbProducts((prev) => [...prev, rowToProduct(data)])
    return { ok: true }
  }

  const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update(productToRow(updates))
      .eq('id', id)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }

    setDbProducts((prev) => prev.map((p) => (p.id === id ? rowToProduct(data) : p)))
    return { ok: true }
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }

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
