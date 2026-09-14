import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate, loadProfile, requireSeller } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } })

// products table (snake_case) <-> API body/response (camelCase) — same
// mapping that used to live client-side in ProductsContext.jsx. Every row
// here was, by construction, added by a seller — sellerAdded:true lets the
// frontend's existing `.filter(p => p.sellerAdded)` call sites keep working
// unchanged (the static demo catalog stays purely client-side, unaffected).
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

// GET /api/products — public, no auth. Anyone browsing the shop needs this.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('products').select('*')
    if (error) return res.status(500).json({ error: error.message })
    res.json((data ?? []).map(rowToProduct))
  })
)

// POST /api/products — seller only.
router.post(
  '/',
  authenticate,
  loadProfile,
  requireSeller,
  asyncHandler(async (req, res) => {
    const row = { ...productToRow(req.body), seller_id: req.userId }
    const { data, error } = await supabaseAdmin.from('products').insert(row).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(rowToProduct(data))
  })
)

// Ownership check shared by PATCH/DELETE/image-upload below.
const loadOwnedProduct = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin.from('products').select('id, seller_id').eq('id', req.params.id).single()
  if (error || !data) return res.status(404).json({ error: 'Product not found' })
  if (data.seller_id !== req.userId) return res.status(403).json({ error: 'Not your product' })
  next()
})

// PATCH /api/products/:id — seller, owner only.
router.patch(
  '/:id',
  authenticate,
  loadProfile,
  requireSeller,
  loadOwnedProduct,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productToRow(req.body))
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(rowToProduct(data))
  })
)

// DELETE /api/products/:id — seller, owner only.
router.delete(
  '/:id',
  authenticate,
  loadProfile,
  requireSeller,
  loadOwnedProduct,
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.status(204).end()
  })
)

// POST /api/products/images — any seller. Proxies the file to Supabase
// Storage server-side (multer buffers it in memory; nothing touches disk)
// instead of the client uploading with its own credentials. Scoped to the
// seller's own folder, not a specific product's — photos get uploaded
// progressively while filling out the "Add Product" form, before the
// product itself exists yet, same as the original client-side flow.
router.post(
  '/images',
  authenticate,
  loadProfile,
  requireSeller,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const path = `${req.userId}/${randomUUID()}-${req.file.originalname}`
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(path, req.file.buffer, { contentType: req.file.mimetype })
    if (error) return res.status(400).json({ error: error.message })
    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path)
    res.status(201).json({ url: data.publicUrl })
  })
)

export default router
