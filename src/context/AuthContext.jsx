import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { api } from '../lib/apiClient'

const AuthContext = createContext(null)

// Auth itself (signUp/signInWithPassword/signOut/session) stays direct to
// Supabase — it already hashes passwords and issues real JWTs, no reason
// to reinvent that. Everything about the `profiles` table goes through the
// new Express API instead (see server/routes/profile.js), which does its
// own row<->camelCase mapping server-side now — this file just sends/reads
// plain camelCase objects.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const result = await api.get('/profile', { token: session.access_token })
        if (active && result.ok) setUser(result.data)
      }
      if (active) setLoading(false)
    }
    loadSession()

    // Keeps the session in sync on sign-in/out — including a logout that
    // happens in another tab.
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      const result = await api.get('/profile', { token: session.access_token })
      if (result.ok) setUser(result.data)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Used by Signup and SellerSignup: creates a real Supabase Auth account
  // (hashed password, handled entirely by Supabase — never touches our
  // code) plus a matching row in `profiles` via the API for everything else.
  const registerAccount = async ({ password, ...profile }) => {
    const { data, error } = await supabase.auth.signUp({ email: profile.email, password })
    if (error) return { ok: false, error: error.message }

    if (!data.session) {
      // This Supabase project requires email confirmation before a session
      // exists, so we can't call the (authenticated) profile API yet. It
      // gets created on their first successful login instead.
      return {
        ok: false,
        error: 'Check your email to confirm your account, then log in.',
      }
    }

    // Passing the token straight from signUp()'s own response, rather than
    // letting this call fetch it via getSession() itself — that call would
    // race the auth-state-change listener above (it fires the instant
    // signUp() returns a session, calling getSession() itself), which was
    // unreliable in testing. PATCH is an upsert server-side (see
    // server/routes/profile.js) — it creates the row if the listener's own
    // concurrent fetch hasn't already, or updates it if it has, in one
    // round trip either way, with the real values from the signup form.
    const token = data.session.access_token
    const result = await api.patch('/profile', profile, { token })
    if (!result.ok) return result

    setUser(result.data)
    return { ok: true }
  }

  // Used by Login: real Supabase credential check (bcrypt-hashed
  // comparison server-side, not our code) instead of a hand-rolled one.
  const authenticate = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }

    // Same reasoning as registerAccount — use the token signInWithPassword
    // already gave us instead of a second, potentially-stalled getSession().
    const token = data.session.access_token

    // GET auto-creates a minimal default profile if one doesn't exist yet
    // (first login after confirming an email-verified signup, where no
    // session existed at signup time to create it then).
    const result = await api.get('/profile', { token })
    if (!result.ok) return result

    setUser(result.data)
    return { ok: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (updates) => {
    if (!user) return { ok: false, error: 'Not signed in' }

    const result = await api.patch('/profile', updates)
    if (!result.ok) return result

    setUser((prev) => ({ ...prev, ...updates }))
    return { ok: true }
  }

  const value = { user, isAuthenticated: Boolean(user), loading, registerAccount, authenticate, logout, updateUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
