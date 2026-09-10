// Shared between the seller's Orders dashboard and the buyer's Profile page
// — both render order_items rows the same way, just scoped to a different
// audience (seller's own products vs. a buyer's own purchases).

export const ORDER_STATUS_STYLES = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
}

export function formatOrderDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// order_items row -> the display shape the UI expects (name, category,
// images, etc. live in `snapshot`, taken at checkout time).
export function rowToLineItem(row) {
  return { ...row.snapshot, id: row.product_id, qty: row.qty, price: row.price }
}
