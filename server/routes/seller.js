import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate, loadProfile, requireSeller } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate, loadProfile, requireSeller)

const STATUS_FLOW = ['Processing', 'Shipped', 'Delivered']

function rowToLineItem(row) {
  return { ...row.snapshot, id: row.product_id, qty: row.qty, price: row.price }
}

// GET /api/seller/orders — only orders containing this seller's own products.
router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status, order_items(id, product_id, price, qty, snapshot, seller_id)')
      .eq('order_items.seller_id', req.userId)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })

    const shaped = (data ?? [])
      .filter((o) => o.order_items.length > 0)
      .map((o) => {
        const items = o.order_items.map(rowToLineItem)
        return {
          id: o.id,
          createdAt: o.created_at,
          status: o.status,
          items,
          // Only this seller's share — a single checkout can include other
          // sellers' products too.
          total: items.reduce((sum, item) => sum + item.qty * item.price, 0),
        }
      })
    res.json(shaped)
  })
)

// PATCH /api/seller/orders/:id/status — advance to the next status.
// Ownership: the caller must have at least one item on this order.
router.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { data: myItems } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', req.params.id)
      .eq('seller_id', req.userId)
      .limit(1)
    if (!myItems || myItems.length === 0) return res.status(403).json({ error: 'Not your order' })

    const { data: order } = await supabaseAdmin.from('orders').select('status').eq('id', req.params.id).single()
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const nextIndex = STATUS_FLOW.indexOf(order.status) + 1
    if (nextIndex >= STATUS_FLOW.length) return res.status(400).json({ error: 'Order is already delivered' })
    const nextStatus = STATUS_FLOW[nextIndex]

    const { error } = await supabaseAdmin.from('orders').update({ status: nextStatus }).eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ status: nextStatus })
  })
)

// GET /api/seller/stats — order count + revenue for this seller's dashboard.
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('order_items').select('order_id, price, qty').eq('seller_id', req.userId)
    if (error) return res.status(500).json({ error: error.message })

    const rows = data ?? []
    res.json({
      orderCount: new Set(rows.map((r) => r.order_id)).size,
      revenue: rows.reduce((sum, r) => sum + r.price * r.qty, 0),
    })
  })
)

export default router
