import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.use(authenticate)

// profiles table (snake_case) <-> API body/response (camelCase) — same
// mapping that used to live client-side in AuthContext.jsx.
const FIELD_MAP = {
  name: 'name',
  email: 'email',
  isSeller: 'is_seller',
  businessName: 'business_name',
  businessCategory: 'business_category',
  businessAddress: 'business_address',
  storeDescription: 'store_description',
  businessLogo: 'business_logo',
  phone: 'phone',
}

function toRow(profile) {
  const row = {}
  for (const [key, value] of Object.entries(profile)) {
    if (FIELD_MAP[key]) row[FIELD_MAP[key]] = value
  }
  return row
}

function rowToUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isSeller: row.is_seller ?? false,
    businessName: row.business_name || undefined,
    businessCategory: row.business_category || undefined,
    businessAddress: row.business_address || undefined,
    storeDescription: row.store_description || undefined,
    businessLogo: row.business_logo || undefined,
    phone: row.phone || undefined,
  }
}

// GET /api/profile — fetch own profile. Auto-creates a minimal default row
// if one doesn't exist yet: on login, that's a first login after an
// email-confirm signup (no session existed at signup time to create it
// then); on signup, this same fallback can race against the
// onAuthStateChange listener's own GET (both fire the instant signUp()
// returns a session). An upsert (not a plain insert) makes that race
// harmless — both calls converge on the same generic default row, and
// registerAccount's follow-up PATCH fills in the real values afterward
// regardless of which GET "won".
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let { data } = await supabaseAdmin.from('profiles').select('*').eq('id', req.userId).single()
    if (!data) {
      const row = { id: req.userId, name: req.userEmail.split('@')[0], email: req.userEmail, is_seller: false }
      const { data: upserted, error } = await supabaseAdmin
        .from('profiles')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single()
      if (error) return res.status(500).json({ error: error.message })
      data = upserted
    }
    res.json(rowToUser(data))
  })
)

// PATCH /api/profile — create-or-update own profile in one call. Signup
// calls this directly with the real submitted values (no preceding GET —
// upsert makes a separate "does it exist yet" round trip unnecessary, and
// one less client-side call means one less thing that can race the
// onAuthStateChange listener's own concurrent profile fetch). Existing
// callers doing a partial edit (Settings/Profile page) are safe too: their
// target row is always guaranteed to exist already, so this always takes
// the update path for them, just via upsert's merge-on-conflict instead of
// a plain .update().
router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const row = { ...toRow(req.body), id: req.userId }
    const { data, error } = await supabaseAdmin.from('profiles').upsert(row, { onConflict: 'id' }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(rowToUser(data))
  })
)

export default router
