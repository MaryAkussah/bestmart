import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineKey } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabaseClient'
import { getPasswordError, generatePassword, PASSWORD_REQUIREMENTS_TEXT } from '../utils/passwordPolicy'

/**
 * Landed on via the emailed reset link. Supabase puts the reader here with
 * a recovery-only session already established (it parses the token out of
 * the URL itself) and fires a PASSWORD_RECOVERY auth event — that's what
 * this page waits for before showing the form, rather than trusting the URL
 * directly. An expired/invalid link fails with no such event and the user
 * stays on a "checking" state that we time out into an error after a beat.
 */
function ResetPassword() {
  const [status, setStatus] = useState('checking') // checking | ready | invalid
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Some link errors (expired/used) come back as ?error=... in the URL
    // instead of ever firing an auth event.
    if (window.location.hash.includes('error') || window.location.search.includes('error')) {
      setStatus('invalid')
      return
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus('ready')
    })
    const timeout = setTimeout(() => setStatus((s) => (s === 'checking' ? 'invalid' : s)), 4000)

    return () => {
      clearTimeout(timeout)
      listener.subscription.unsubscribe()
    }
  }, [])

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
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setSubmitting(false)

    if (error) {
      setErrors({ form: error.message })
      return
    }

    setDone(true)
    // Sign out of the recovery session so they land on /login fresh rather
    // than GuestRoute bouncing them away from it while still signed in.
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login', { replace: true }), 1800)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <HiOutlineKey className="text-brand-blue" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Choose a new password for your account.</p>
        </div>

        {status === 'checking' ? (
          <p className="text-center text-sm text-gray-500">Verifying your reset link...</p>
        ) : status === 'invalid' ? (
          <div>
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              This reset link is invalid or has expired. Request a new one to continue.
            </div>
            <Link to="/forgot-password">
              <Button variant="outline" className="w-full mt-4">
                Request a new link
              </Button>
            </Link>
          </div>
        ) : done ? (
          <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
            Your password has been reset. Redirecting you to log in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
                {errors.form}
              </div>
            )}
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              label="New password"
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
              autoComplete="new-password"
              label="Confirm new password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-brand-blue font-medium hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
