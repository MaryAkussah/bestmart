import { useState, useRef } from 'react'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCube,
  HiOutlineArrowUpTray,
} from 'react-icons/hi2'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useProducts } from '../../context/ProductsContext'
import { useAuth } from '../../context/AuthContext'
import { getProductImages, getPrimaryImage } from '../../utils/productImages'
import { supabase } from '../../lib/supabaseClient'

const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 3MB — data URLs live in localStorage, so keep this modest
const MAX_IMAGES = 10

const emptyForm = { name: '', category: '', price: '', oldPrice: '', images: [] }

function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts()
  const { user } = useAuth()

  const myProducts = products.filter((p) => p.sellerAdded)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - form.images.length
    if (remainingSlots <= 0) {
      setErrors((prev) => ({ ...prev, images: `You can upload up to ${MAX_IMAGES} photos` }))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const accepted = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_IMAGE_BYTES)
    const rejectedType = files.some((f) => !f.type.startsWith('image/'))
    const rejectedSize = files.some((f) => f.type.startsWith('image/') && f.size > MAX_IMAGE_BYTES)
    const toAdd = accepted.slice(0, remainingSlots)

    if (rejectedType) {
      setErrors((prev) => ({ ...prev, images: 'Only image files are allowed' }))
    } else if (rejectedSize) {
      setErrors((prev) => ({ ...prev, images: 'Each image must be under 3MB' }))
    } else if (accepted.length > remainingSlots) {
      setErrors((prev) => ({ ...prev, images: `Only ${remainingSlots} more photo(s) could be added (max ${MAX_IMAGES})` }))
    } else {
      setErrors((prev) => ({ ...prev, images: undefined }))
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    if (toAdd.length === 0) return

    setUploadingImages(true)
    const uploaded = await Promise.all(
      toAdd.map(async (file) => {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (error) return null
        return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      })
    )
    setUploadingImages(false)

    const successUrls = uploaded.filter(Boolean)
    if (successUrls.length < toAdd.length) {
      setErrors((prev) => ({ ...prev, images: 'Some photos failed to upload — please try again' }))
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...successUrls].slice(0, MAX_IMAGES) }))
  }

  const handleRemoveImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Product name is required'
    if (!form.category) next.category = 'Choose a category'
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a valid price'
    if (form.oldPrice && Number(form.oldPrice) <= Number(form.price)) {
      next.oldPrice = 'Original price must be higher than the current price'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      images: getProductImages(product),
    })
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      images: form.images,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    }

    setSubmitting(true)
    const result = editingId
      ? await updateProduct(editingId, payload)
      : await addProduct({ ...payload, seller: user?.businessName || user?.name || 'You' })
    setSubmitting(false)

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, form: result.error }))
      return
    }
    closeForm()
  }

  const handleDelete = async (product) => {
    if (window.confirm(`Remove "${product.name}" from your listings?`)) {
      await deleteProduct(product.id)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-1">Manage the products you're selling on BestMart.</p>
        </div>
        <Button onClick={openAddForm} className="shrink-0">
          <HiOutlinePlus size={18} />
          Add Product
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600"
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>

          {errors.form && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-2.5">
              {errors.form}
            </div>
          )}

          {/* Product photos */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Product Photos</label>
              <span className="text-xs text-gray-400">{form.images.length}/{MAX_IMAGES}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {form.images.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={src} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <HiOutlineXMark size={12} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-brand-blue text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {form.images.length < MAX_IMAGES && (
                <label className={`aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 transition ${uploadingImages ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-brand-blue hover:bg-blue-50'}`}>
                  <HiOutlineArrowUpTray className="text-gray-400" size={16} />
                  <span className="text-[10px] text-gray-400 text-center px-1">
                    {uploadingImages ? 'Uploading...' : 'Add Photo'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImages}
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              PNG or JPG, up to 3MB each, up to {MAX_IMAGES} photos. Optional — we'll use a category
              photo if you skip this. The first photo is shown as the main image.
            </p>
            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-x-4">
            <Input
              id="name"
              name="name"
              label="Product name"
              placeholder="e.g. Handmade Leather Wallet"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.category ? 'border-red-400' : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <Input
              id="price"
              name="price"
              type="number"
              min="1"
              label="Price (₵)"
              placeholder="e.g. 150"
              value={form.price}
              onChange={handleChange}
              error={errors.price}
            />

            <Input
              id="oldPrice"
              name="oldPrice"
              type="number"
              min="1"
              label="Original price (optional, to show a discount)"
              placeholder="e.g. 200"
              value={form.oldPrice}
              onChange={handleChange}
              error={errors.oldPrice}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || uploadingImages}>
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {myProducts.length === 0 ? (
          <div className="p-16 text-center">
            <HiOutlineCube className="mx-auto text-gray-300" size={40} />
            <p className="text-gray-500 mt-3">You haven't listed any products yet.</p>
            <Button onClick={openAddForm} className="mt-5">
              <HiOutlinePlus size={18} />
              List your first product
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4">
                <img
                  src={getPrimaryImage(product)}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.category}
                    {getProductImages(product).length > 1 && ` · ${getProductImages(product).length} photos`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900">₵{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-xs text-gray-400 line-through">₵{product.oldPrice}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(product)}
                    aria-label="Edit product"
                    className="p-2 text-gray-400 hover:text-brand-blue transition"
                  >
                    <HiOutlinePencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    aria-label="Delete product"
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
