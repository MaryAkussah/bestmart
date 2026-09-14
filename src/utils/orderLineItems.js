// Shared between the seller's Orders dashboard and the buyer's Profile page
// for consistent order display — the row shaping itself now happens
// server-side (server/routes/orders.js, server/routes/seller.js).

export const ORDER_STATUS_STYLES = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
}

export function formatOrderDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
