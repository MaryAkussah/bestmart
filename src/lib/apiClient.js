import { supabase } from './supabaseClient'

const BASE = '/api'

// `token` lets a caller pass an access token it already has in hand
// (e.g. straight from signUp()/signInWithPassword()'s own return value)
// instead of this function calling supabase.auth.getSession() itself.
// That matters right after a sign-in/sign-up: Supabase's auth client
// serializes getSession() calls internally, and the auth-state-change
// listener (AuthContext.jsx) already calls getSession() the instant a
// session appears — a second concurrent call from application code can
// stall indefinitely waiting on that same internal lock. Everywhere else,
// omitting `token` and letting this read the current session is fine.
async function request(method, path, body, { isFormData = false, token } = {}) {
  let accessToken = token
  if (!accessToken) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    accessToken = session?.access_token
  }

  const headers = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  if (res.status === 204) return { ok: true, data: null }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    // No JSON body (e.g. a network-level failure) — payload stays null.
  }

  if (!res.ok) {
    return { ok: false, error: payload?.error || `Request failed (${res.status})` }
  }
  return { ok: true, data: payload }
}

// Every Context/page that used to call `supabase.from(...)` directly now
// calls this instead — same {ok, error} shape they already handle, plus
// `data` for reads. Auth (signup/login/logout/reset) and Realtime
// subscriptions are unchanged and still talk to Supabase directly.
export const api = {
  get: (path, opts) => request('GET', path, undefined, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  patch: (path, body, opts) => request('PATCH', path, body, opts),
  delete: (path, opts) => request('DELETE', path, undefined, opts),
}
