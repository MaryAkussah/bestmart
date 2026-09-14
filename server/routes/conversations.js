import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate)

// conversations row -> the shape the frontend works with, from this
// viewer's point of view.
function shapeConversation(row, userId, nameMap, preview) {
  const isBuyer = row.buyer_id === userId
  const otherId = isBuyer ? row.seller_id : row.buyer_id
  const otherProfile = nameMap?.[otherId]
  const otherName = isBuyer
    ? otherProfile?.business_name || otherProfile?.name || 'Seller'
    : otherProfile?.name || 'Buyer'
  const myReadAt = isBuyer ? row.buyer_last_read_at : row.seller_last_read_at
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    otherId,
    isBuyer,
    otherName,
    lastMessageAt: row.last_message_at,
    unread: new Date(row.last_message_at) > new Date(myReadAt),
    preview: preview || '',
  }
}

// Server-side, there's no need for the get_conversation_partner_names RPC
// the client uses (that existed to work around the client's own restricted
// RLS access to `profiles`) — the service-role key already sees every row.
async function loadConversationsForUser(userId) {
  const { data: rows } = await supabaseAdmin
    .from('conversations')
    .select('id, buyer_id, seller_id, last_message_at, buyer_last_read_at, seller_last_read_at')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  const otherIds = [...new Set((rows ?? []).map((r) => (r.buyer_id === userId ? r.seller_id : r.buyer_id)))]
  const nameMap = {}
  if (otherIds.length > 0) {
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, name, business_name').in('id', otherIds)
    for (const p of profiles ?? []) nameMap[p.id] = p
  }

  const ids = (rows ?? []).map((r) => r.id)
  const previews = {}
  if (ids.length > 0) {
    const { data: msgRows } = await supabaseAdmin
      .from('messages')
      .select('conversation_id, body, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false })
    for (const m of msgRows ?? []) {
      if (!previews[m.conversation_id]) previews[m.conversation_id] = m.body
    }
  }

  return (rows ?? []).map((r) => shapeConversation(r, userId, nameMap, previews[r.id]))
}

// GET /api/conversations
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await loadConversationsForUser(req.userId))
  })
)

// POST /api/conversations — find-or-create the thread with a seller.
// body: { sellerId }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const sellerId = req.body.sellerId
    if (!sellerId) return res.status(400).json({ error: 'sellerId is required' })
    if (sellerId === req.userId) return res.status(400).json({ error: "Can't message yourself" })

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .upsert({ buyer_id: req.userId, seller_id: sellerId }, { onConflict: 'buyer_id,seller_id' })
      .select('id')
      .single()
    if (error) return res.status(400).json({ error: error.message })

    const conversations = await loadConversationsForUser(req.userId)
    res.status(201).json(conversations.find((c) => c.id === data.id))
  })
)

// Every /:id route below requires the caller to be a participant.
const requireParticipant = asyncHandler(async (req, res, next) => {
  const { data } = await supabaseAdmin
    .from('conversations')
    .select('id, buyer_id, seller_id, buyer_last_read_at, seller_last_read_at')
    .eq('id', req.params.id)
    .single()
  if (!data || (data.buyer_id !== req.userId && data.seller_id !== req.userId)) {
    return res.status(404).json({ error: 'Conversation not found' })
  }
  req.conversation = data
  next()
})

// GET /api/conversations/:id/messages
router.get(
  '/:id/messages',
  requireParticipant,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    res.json(data ?? [])
  })
)

// POST /api/conversations/:id/messages — body: { body, productId?, productName? }
// This INSERT lands in the same table the client's Realtime subscription
// watches, so live delivery keeps working without the client needing to
// write here directly.
router.post(
  '/:id/messages',
  requireParticipant,
  asyncHandler(async (req, res) => {
    const text = (req.body.body || '').trim()
    if (!text) return res.status(400).json({ error: 'Message body is required' })

    const isBuyer = req.conversation.buyer_id === req.userId
    const payload = {
      conversation_id: req.params.id,
      sender_id: req.userId,
      body: text,
      ...(req.body.productId ? { product_id: req.body.productId, product_name: req.body.productName } : {}),
    }
    const { data: message, error } = await supabaseAdmin.from('messages').insert(payload).select().single()
    if (error) return res.status(400).json({ error: error.message })

    const column = isBuyer ? 'buyer_last_read_at' : 'seller_last_read_at'
    const now = new Date().toISOString()
    await supabaseAdmin.from('conversations').update({ last_message_at: now, [column]: now }).eq('id', req.params.id)

    res.status(201).json(message)
  })
)

// PATCH /api/conversations/:id/read
router.patch(
  '/:id/read',
  requireParticipant,
  asyncHandler(async (req, res) => {
    const isBuyer = req.conversation.buyer_id === req.userId
    const column = isBuyer ? 'buyer_last_read_at' : 'seller_last_read_at'
    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ [column]: new Date().toISOString() })
      .eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ ok: true })
  })
)

export default router
