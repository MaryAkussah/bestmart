import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

// cart_items rows -> the app's in-memory cart item shape. product_snapshot
// holds whatever fields the product had at add-time (name/price/category/
// images/seller/sellerId) — the cart never re-syncs against the live
// product, same as before this was server-backed.
function rowToItem(row) {
  return { ...row.product_snapshot, id: row.product_id, qty: row.qty }
}

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
    supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (active) {
          setItems((data ?? []).map(rowToItem))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user])

  const addToCart = async (product) => {
    if (!user) return { ok: false, error: 'Not signed in' }

    const existing = items.find((item) => item.id === product.id)

    if (existing) {
      const qty = existing.qty + 1
      const { error } = await supabase
        .from('cart_items')
        .update({ qty })
        .eq('user_id', user.id)
        .eq('product_id', product.id)
      if (error) return { ok: false, error: error.message }

      setItems((prev) => prev.map((item) => (item.id === product.id ? { ...item, qty } : item)))
      return { ok: true }
    }

    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      product_id: product.id,
      qty: 1,
      product_snapshot: product,
    })
    if (error) return { ok: false, error: error.message }

    setItems((prev) => [...prev, { ...product, qty: 1 }])
    return { ok: true }
  }

  const removeFromCart = async (id) => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = async (id, qty) => {
    if (!user || qty < 1) return
    await supabase.from('cart_items').update({ qty }).eq('user_id', user.id).eq('product_id', id)
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0)

  // Turns the current cart into a real order: one `orders` header row plus
  // one `order_items` row per line item (carrying seller_id so the seller
  // dashboard can later find exactly the orders that include their
  // products), then empties the cart.
  const checkout = async () => {
    if (!user || items.length === 0) return { ok: false, error: 'Your cart is empty' }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: user.id, total, status: 'Processing' })
      .select()
      .single()
    if (orderError) return { ok: false, error: orderError.message }

    const orderItemRows = items.map((item) => {
      const { id, qty, price, ...snapshot } = item
      return {
        order_id: order.id,
        product_id: id,
        seller_id: item.sellerId ?? null,
        buyer_id: user.id,
        price,
        qty,
        snapshot,
      }
    })
    const { error: itemsError } = await supabase.from('order_items').insert(orderItemRows)
    if (itemsError) return { ok: false, error: itemsError.message }

    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])

    return {
      ok: true,
      order: { id: order.id, items, total, status: order.status, createdAt: order.created_at },
    }
  }

  const value = { items, loading, addToCart, removeFromCart, updateQty, count, total, checkout }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
