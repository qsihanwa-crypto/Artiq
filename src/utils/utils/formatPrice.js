import { site } from '../data/site'

// Formats a whole-ringgit number as 'MYR 3,200'. Laravel serializes decimal
// columns as strings, so valid numeric strings are normalized here too.
// Single source of truth for currency across the catalogue and cart.
export function formatPrice(n) {
  const price = typeof n === 'string' && n.trim() !== '' ? Number(n) : n
  if (typeof price !== 'number' || !Number.isFinite(price)) return 'Price on request'
  return `${site.currency} ${price.toLocaleString('en-MY')}`
}
