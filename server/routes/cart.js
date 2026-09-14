import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate)

// cart_items row -> the app's cart item shape. product_snapshot holds
// whatever fields the product had at add-time — the cart never re-syncs
// against the live product.
function rowToItem(row) {
  return { ...row.product_snapshot, id: row.product_id, qty: row.qty }
}

// GET /api/cart
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('cart_items').select('*').eq('user_id', req.userId)
    if (error) return res.status(500).json({ error: error.message })
    res.json((data ?? []).map(rowToItem))
  })
)

// POST /api/cart — body: { product }. Increments qty if already in the cart.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const product = req.body.product
    if (!product?.id) return res.status(400).json({ error: 'product is required' })

    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('qty')
      .eq('user_id', req.userId)
      .eq('product_id', product.id)
      .maybeSingle()

    if (existing) {
      const qty = existing.qty + 1
      const { error } = await supabaseAdmin
        .from('cart_items')
        .update({ qty })
        .eq('user_id', req.userId)
        .eq('product_id', product.id)
      if (error) return res.status(400).json({ error: error.message })
      return res.json({ ...product, qty })
    }

    const { error } = await supabaseAdmin
      .from('cart_items')
      .insert({ user_id: req.userId, product_id: product.id, qty: 1, product_snapshot: product })
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json({ ...product, qty: 1 })
  })
)

// PATCH /api/cart/:productId — body: { qty }
router.patch(
  '/:productId',
  asyncHandler(async (req, res) => {
    const qty = Number(req.body.qty)
    if (!qty || qty < 1) return res.status(400).json({ error: 'qty must be at least 1' })
    const { error } = await supabaseAdmin
      .from('cart_items')
      .update({ qty })
      .eq('user_id', req.userId)
      .eq('product_id', req.params.productId)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ ok: true })
  })
)

// DELETE /api/cart/:productId
router.delete(
  '/:productId',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', req.userId)
      .eq('product_id', req.params.productId)
    if (error) return res.status(400).json({ error: error.message })
    res.status(204).end()
  })
)

export default router
