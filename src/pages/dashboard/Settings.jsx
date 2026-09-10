import { useState, useRef } from 'react'
import { HiOutlinePhoto, HiOutlineArrowUpTray } from 'react-icons/hi2'
import Input from '../../components/ui/Input'
import TextArea from '../../components/ui/TextArea'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'

const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 3MB — stored as a data URL in localStorage

function Settings() {
  const { user, updateUser } = useAuth()
  const { categories } = useProducts()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    businessCategory: user?.businessCategory || '',
    businessAddress: user?.businessAddress || '',
    storeDescription: user?.storeDescription || '',
    businessLogo: user?.businessLogo || '',
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, businessLogo: 'Please choose an image file' }))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, businessLogo: 'Image must be under 3MB' }))
      return
    }

    setErrors((prev) => ({ ...prev, businessLogo: undefined }))
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, businessLogo: reader.result }))
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, businessLogo: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSaved(false)
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const result = await updateUser(form)
    setSubmitting(false)

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, form: result.error }))
      return
    }
    setSaved(true)
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-600 mt-1">Manage your seller profile and store details.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8"
      >
        {errors.form && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
            {errors.form}
          </div>
        )}
        {saved && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-4 py-2.5">
            Your settings have been saved.
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Your details
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Input
            id="name"
            name="name"
            label="Full name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
        </div>
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone number"
          placeholder="e.g. 024 123 4567"
          value={form.phone}
          onChange={handleChange}
        />

        <div className="border-t border-gray-100 my-5" />

        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Business details
        </h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {form.businessLogo ? (
                <img src={form.businessLogo} alt="Business logo preview" className="w-full h-full object-cover" />
              ) : (
                <HiOutlinePhoto className="text-gray-300" size={22} />
              )}
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue border border-brand-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer">
                <HiOutlineArrowUpTray size={14} />
                {form.businessLogo ? 'Change Logo' : 'Upload Logo'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              {form.businessLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
          {errors.businessLogo && <p className="mt-1 text-sm text-red-500">{errors.businessLogo}</p>}
        </div>

        <Input
          id="businessName"
          name="businessName"
          label="Business name"
          placeholder="e.g. Osu Threads"
          value={form.businessName}
          onChange={handleChange}
        />

        <div className="grid sm:grid-cols-2 gap-x-4">
          <div className="mb-4">
            <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700 mb-1.5">
              What you sell
            </label>
            <select
              id="businessCategory"
              name="businessCategory"
              value={form.businessCategory}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Input
            id="businessAddress"
            name="businessAddress"
            label="Business location"
            placeholder="e.g. Osu, Accra"
            value={form.businessAddress}
            onChange={handleChange}
          />
        </div>

        <TextArea
          id="storeDescription"
          name="storeDescription"
          label="Store description"
          rows={4}
          placeholder="Tell shoppers a little about your store..."
          value={form.storeDescription}
          onChange={handleChange}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}

export default Settings
