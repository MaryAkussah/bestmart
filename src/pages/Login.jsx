import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { authenticate } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const result = await authenticate(form.email, form.password)
    setSubmitting(false)

    if (!result.ok) {
      setErrors({ password: result.error })
      return
    }

    // No specific page to return to -> the shop, same as Signup and
    // GuestRoute's own fallback (they must all agree — see GuestRoute.jsx).
    const redirectTo = location.state?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <HiOutlineShoppingBag className="text-brand-blue" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to your BestMart account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            onToggleVisibility={() => setShowPassword((prev) => !prev)}
          />

          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-brand-blue font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-blue font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
