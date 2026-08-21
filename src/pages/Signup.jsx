import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      login({ name: form.name, email: form.email })
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <HiOutlineShoppingBag className="text-brand-blue" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join BestMart and start shopping today</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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
            type="password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
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

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
