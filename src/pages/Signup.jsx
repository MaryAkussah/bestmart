import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getPasswordError, generatePassword, PASSWORD_REQUIREMENTS_TEXT } from '../utils/passwordPolicy'

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const { registerAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGeneratePassword = async () => {
    const generated = generatePassword()
    setForm((prev) => ({ ...prev, password: generated, confirmPassword: generated }))
    setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }))
    setShowPassword(true)
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be blocked — the field still shows it in plain text to copy by hand.
    }
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    const passwordError = getPasswordError(form.password)
    if (passwordError) next.password = passwordError
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const result = await registerAccount({
      name: form.name,
      email: form.email,
      password: form.password,
      isSeller: false,
    })
    setSubmitting(false)

    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }

    // New accounts are shoppers by default — land them on the shop so they
    // can browse and buy. "Sell" in the nav is the separate opt-in path.
    const redirectTo = location.state?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <HiOutlineShoppingBag className="text-brand-blue" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {location.state?.from
              ? 'Create a free account to add items to your cart and start shopping.'
              : 'Join BestMart and start shopping today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
              {errors.form}
            </div>
          )}

          <Input
            id="name"
            name="name"
            label="Full name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            id="email"
            name="email"
            type="email"
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
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            labelAction={
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs font-medium text-brand-blue hover:underline"
              >
                {copied ? 'Copied!' : 'Generate password'}
              </button>
            }
          />
          {!errors.password && (
            <p className="-mt-3 mb-4 text-xs text-gray-400">{PASSWORD_REQUIREMENTS_TEXT}</p>
          )}
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirm password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <label className="flex items-start gap-2 text-sm text-gray-600 mb-6">
            <input
              type="checkbox"
              required
              className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            I agree to the Terms of Service and Privacy Policy
          </label>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" state={{ from: location.state?.from }} className="text-brand-blue font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
