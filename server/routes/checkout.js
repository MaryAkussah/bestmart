import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate)

function rowToItem(row) {
  return { ...row.product_snapshot, id: row.product_id, qty: row.qty }
}

// POST /api/checkout — turns the caller's cart into a real order: one
// `orders` header row plus one `order_items` row per line item (carrying
// seller_id so the seller dashboard can find exactly the orders that
// include their products), then empties the cart. A good example of logic
// that belongs server-side: several writes that need to succeed together.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data: items } = await supabaseAdmin.from('cart_items').select('*').eq('user_id', req.userId)
    if (!items || items.length === 0) return res.status(400).json({ error: 'Your cart is empty' })

    const shaped = items.map(rowToItem)
    const total = shaped.reduce((sum, item) => sum + item.qty * item.price, 0)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ user_id: req.userId, total, status: 'Processing' })
      .select()
      .single()
    if (orderError) return res.status(400).json({ error: orderError.message })

    const orderItemRows = shaped.map((item) => {
      const { id, qty, price, ...snapshot } = item
      return {
        order_id: order.id,
        product_id: id,
        seller_id: item.sellerId ?? null,
        buyer_id: req.userId,
        price,
        qty,
        snapshot,
      }
    })
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemRows)
    if (itemsError) return res.status(400).json({ error: itemsError.message })

    await supabaseAdmin.from('cart_items').delete().eq('user_id', req.userId)

    res.status(201).json({ id: order.id, items: shaped, total, status: order.status, createdAt: order.created_at })
  })
)

export default router
