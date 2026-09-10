import { useState } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineBuildingStorefront, HiOutlineCube, HiOutlineMegaphone, HiOutlineChartBar } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getPasswordError, generatePassword, PASSWORD_REQUIREMENTS_TEXT } from '../utils/passwordPolicy'

const perks = [
  { icon: HiOutlineCube, text: 'List unlimited products' },
  { icon: HiOutlineMegaphone, text: 'Run ads to reach shoppers' },
  { icon: HiOutlineChartBar, text: 'Track orders and revenue' },
]

const emptyForm = { name: '', businessName: '', email: '', password: '', confirmPassword: '' }

/**
 * The seller side of auth — distinct from the buyer Login/Signup pair.
 * Deliberately just the essentials (name, shop name, email, password) so
 * signing up is quick; everything else about the shop (category, address,
 * logo, description) is filled in afterwards from Settings in the
 * dashboard. Someone already signed in as a buyer only needs to add the
 * shop name to upgrade that same account.
 */
function SellerSignup() {
  const { isAuthenticated, loading, user, registerAccount, updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  if (loading) return null

  if (user?.isSeller) {
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

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
    if (!isAuthenticated) {
      if (!form.name.trim()) next.name = 'Your name is required'
      if (!form.email.trim()) next.email = 'Email is required'
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
      const passwordError = getPasswordError(form.password)
      if (passwordError) next.password = passwordError
      if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    }
    if (!form.businessName.trim()) next.businessName = 'Shop name is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const sellerDetails = {
      isSeller: true,
      businessName: form.businessName.trim(),
    }

    setSubmitting(true)
    const result = isAuthenticated
      ? await updateUser(sellerDetails)
      : await registerAccount({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          ...sellerDetails,
        })
    setSubmitting(false)

    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }

    const redirectTo = location.state?.from?.pathname || '/dashboard'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <HiOutlineBuildingStorefront className="text-brand-blue" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Register Your Business</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAuthenticated
              ? 'Give your shop a name to start selling on BestMart.'
              : 'Create a seller account to list products and reach shoppers across Ghana.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {perks.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center text-center gap-1.5 bg-blue-50 rounded-lg px-2 py-3">
              <Icon className="text-brand-blue" size={20} />
              <span className="text-xs text-gray-600">{text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
              {errors.form}
            </div>
          )}

          {!isAuthenticated && (
            <Input
              id="name"
              name="name"
              autoComplete="name"
              label="Your full name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
          )}

          <Input
            id="businessName"
            name="businessName"
            label="Shop name"
            placeholder="e.g. Osu Threads"
            value={form.businessName}
            onChange={handleChange}
            error={errors.businessName}
          />

          {!isAuthenticated && (
            <>
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
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  label="Password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                  labelAction={
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-xs font-medium text-brand-blue hover:underline"
                    >
                      {copied ? 'Copied!' : 'Generate'}
                    </button>
                  }
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  label="Confirm password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                />
              </div>
              {!errors.password && (
                <p className="-mt-3 mb-4 text-xs text-gray-400">{PASSWORD_REQUIREMENTS_TEXT}</p>
              )}
            </>
          )}

          <Button type="submit" variant="accent" className="w-full justify-center" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : isAuthenticated
                ? 'Register Shop'
                : 'Create Seller Account'}
          </Button>
        </form>

        {!isAuthenticated ? (
          <div className="text-center text-sm text-gray-600 mt-6 space-y-2">
            <p>
              Already have an account?{' '}
              <Link to="/login" state={{ from: location }} className="text-brand-blue font-medium hover:underline">
                Log in
              </Link>
            </p>
            <p>
              Just want to shop?{' '}
              <Link to="/signup" className="text-brand-blue font-medium hover:underline">
                Sign up as a buyer
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400 mt-6">
            You can add your category, address, logo and description afterwards from Settings.
          </p>
        )}
      </div>
    </div>
  )
}

export default SellerSignup
