import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing server env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
      '(Supabase Dashboard -> Project Settings -> API) — see .env.example.'
  )
}

// Service-role client: bypasses RLS entirely. This is safe ONLY because
// every route that uses it goes through the authenticate/requireSeller
// middleware first — Express is the enforcement point for this whole API,
// the same way RLS is the enforcement point for the client's direct
// Supabase Auth + Realtime usage. Never import this file from src/.
//
// Used for plain data queries (.from(...)) only — NOT for .auth.getUser(),
// which needs a fresh client per call (see createAuthClient below).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// A fresh, throwaway client for verifying one request's token via
// auth.getUser(token) in the `authenticate` middleware. Supabase's auth
// client holds internal state/locking built around a single current
// session; reusing one shared client instance to validate many different
// users' tokens concurrently (one per incoming request) can contend on
// that lock and stall. A new client per call has no shared state to
// contend over — cheap, since it does no network I/O until first used.
export function createAuthClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
