import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'bestmart_cart'
const ORDERS_KEY = 'bestmart_orders'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0)

  // Turns the current cart into an order record (read by the seller
  // dashboard's Orders page) and empties the cart. There's no real backend,
  // so "placing an order" just means persisting a snapshot of it.
  const checkout = () => {
    if (items.length === 0) return null

    const order = {
      id: Date.now(),
      items,
      total,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existingOrders]))
    setItems([])

    return order
  }

  const value = { items, addToCart, removeFromCart, updateQty, count, total, checkout }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
