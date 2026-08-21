import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      login({ name: form.email.split('@')[0], email: form.email })
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    }
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

          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
              Remember me
            </label>
            <a href="#" className="text-brand-blue font-medium hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full">
            Log In
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
