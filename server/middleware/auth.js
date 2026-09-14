import { supabaseAdmin, createAuthClient } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../lib/asyncHandler.js'

/**
 * Verifies the Supabase-issued access token in `Authorization: Bearer
 * <token>` — the same JWT the browser already holds from Supabase Auth
 * (login/signup/session restore are untouched; only what happens with the
 * token afterward is new). Delegates verification to Supabase's own Auth
 * server (supabase.auth.getUser) rather than checking the JWT signature
 * locally — one extra network round trip per request, but it works no
 * matter which signing scheme the project uses (HS256 shared secret vs.
 * newer asymmetric keys) without needing a JWT secret in our own env vars.
 *
 * Uses a fresh client per request (createAuthClient), not the shared
 * supabaseAdmin singleton — reusing one client instance to validate many
 * different users' tokens concurrently stalls on Supabase's internal auth
 * lock (found by testing two accounts signing up at once).
 *
 * Sets req.userId/req.userEmail. This is the auth boundary for the whole
 * API — every route below it trusts req.userId, the same way RLS trusts
 * auth.uid().
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing Authorization header' })

  const { data, error } = await createAuthClient().auth.getUser(token)
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' })

  req.userId = data.user.id
  req.userEmail = data.user.email
  next()
})

/** Attaches req.profile — needed by requireSeller and any route that reads business info. */
export const loadProfile = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', req.userId).single()
  if (error || !data) return res.status(401).json({ error: 'No profile found for this account' })
  req.profile = data
  next()
})

/** Must run after loadProfile. */
export function requireSeller(req, res, next) {
  if (!req.profile?.is_seller) return res.status(403).json({ error: 'Seller account required' })
  next()
}
