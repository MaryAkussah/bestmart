import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'bestmart_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, check if a session was already saved from a previous visit.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = { user, isAuthenticated: Boolean(user), loading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
