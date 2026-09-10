import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// profiles table (snake_case) <-> app user object (camelCase)
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

function rowToUser(row, fallbackEmail) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? fallbackEmail,
    isSeller: row.is_seller ?? false,
    businessName: row.business_name || undefined,
    businessCategory: row.business_category || undefined,
    businessAddress: row.business_address || undefined,
    storeDescription: row.store_description || undefined,
    businessLogo: row.business_logo || undefined,
    phone: row.phone || undefined,
  }
}

async function fetchProfile(id) {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data ?? null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (active) setUser(rowToUser(profile, session.user.email))
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
      const profile = await fetchProfile(session.user.id)
      setUser(rowToUser(profile, session.user.email))
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Used by Signup and SellerSignup: creates a real Supabase Auth account
  // (hashed password, handled entirely by Supabase — never touches our
  // code) plus a matching row in `profiles` for everything else.
  const registerAccount = async ({ password, ...profile }) => {
    const { data, error } = await supabase.auth.signUp({ email: profile.email, password })
    if (error) return { ok: false, error: error.message }

    if (!data.session) {
      // This Supabase project requires email confirmation before a session
      // exists, so we can't write the profile row yet (RLS needs auth.uid()
      // to match). It gets created on their first successful login instead.
      return {
        ok: false,
        error: 'Check your email to confirm your account, then log in.',
      }
    }

    const row = { ...toRow(profile), id: data.user.id }
    const { error: profileError } = await supabase.from('profiles').insert(row)
    if (profileError) return { ok: false, error: profileError.message }

    setUser(rowToUser(row))
    return { ok: true }
  }

  // Used by Login: real Supabase credential check (bcrypt-hashed
  // comparison server-side, not our code) instead of a hand-rolled one.
  const authenticate = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }

    let profile = await fetchProfile(data.user.id)
    if (!profile) {
      // First login after confirming an email-verified signup — the profile
      // row couldn't be created back then (no session yet). Create a
      // minimal default one now; they can fill in shop details from Settings.
      const row = { ...toRow({ name: email.split('@')[0], email, isSeller: false }), id: data.user.id }
      const { data: inserted } = await supabase.from('profiles').insert(row).select().single()
      profile = inserted ?? row
    }

    setUser(rowToUser(profile, data.user.email))
    return { ok: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (updates) => {
    if (!user) return { ok: false, error: 'Not signed in' }

    const { error } = await supabase.from('profiles').update(toRow(updates)).eq('id', user.id)
    if (error) return { ok: false, error: error.message }

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
