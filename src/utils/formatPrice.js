import { site } from '../data/site'

// Formats a whole-ringgit number as 'MYR 3,200'. Non-finite input returns
// 'Price on request' so a missing mock value never renders 'MYR NaN'.
// Single source of truth for currency across the catalogue and cart.
export function formatPrice(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'Price on request'
  return `${site.currency} ${n.toLocaleString('en-MY')}`
}
