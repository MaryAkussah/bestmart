import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineMail } from 'react-icons/hi'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabaseClient'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setEmail(e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Email is required')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email')

    setError('')
    setSubmitting(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)

    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <HiOutlineMail className="text-brand-blue" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Forgot your password?</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter the email on your account and we'll send you a link to reset it.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
            If an account exists for <span className="font-medium">{email}</span>, a reset
            link is on its way. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              error={error}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered it after all?{' '}
          <Link to="/login" className="text-brand-blue font-medium hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
