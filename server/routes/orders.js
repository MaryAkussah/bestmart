import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate)

function rowToLineItem(row) {
  return { ...row.snapshot, id: row.product_id, qty: row.qty, price: row.price }
}

// GET /api/orders — the caller's own purchase history (as a buyer).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status, total, order_items(id, product_id, price, qty, snapshot)')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })

    const shaped = (data ?? []).map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      total: o.total,
      items: o.order_items.map(rowToLineItem),
    }))
    res.json(shaped)
  })
)

export default router
