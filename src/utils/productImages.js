import { categoryImages } from '../data/categoryImages'

/**
 * Products now store a gallery (`images`, up to 10 data URLs). This also
 * reads the older single `image` field so products saved before the
 * gallery existed still display correctly.
 */
export function getProductImages(product) {
  if (product.images && product.images.length > 0) return product.images
  if (product.image) return [product.image]
  return []
}

export function getPrimaryImage(product) {
  const images = getProductImages(product)
  return images[0] || categoryImages[product.category]
}
