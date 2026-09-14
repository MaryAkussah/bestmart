import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/apiClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    api.get('/cart').then((result) => {
      if (active && result.ok) {
        setItems(result.data)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [user])

  const addToCart = async (product) => {
    if (!user) return { ok: false, error: 'Not signed in' }

    const result = await api.post('/cart', { product })
    if (!result.ok) return result

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      return existing
        ? prev.map((item) => (item.id === product.id ? { ...item, qty: result.data.qty } : item))
        : [...prev, result.data]
    })
    return { ok: true }
  }

  const removeFromCart = async (id) => {
    if (!user) return
    await api.delete(`/cart/${id}`)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = async (id, qty) => {
    if (!user || qty < 1) return
    await api.patch(`/cart/${id}`, { qty })
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0)

  // Turns the current cart into a real order via POST /api/checkout — one
  // `orders` header row plus one `order_items` row per line item, several
  // writes that need to succeed together, which is exactly the kind of
  // logic that belongs server-side rather than as separate client calls.
  const checkout = async () => {
    if (!user || items.length === 0) return { ok: false, error: 'Your cart is empty' }

    const result = await api.post('/checkout')
    if (!result.ok) return result

    setItems([])
    return { ok: true, order: result.data }
  }

  const value = { items, loading, addToCart, removeFromCart, updateQty, count, total, checkout }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
