import { site } from '../data/site'
import { formatPrice } from './formatPrice'

/**
 * Plain-text, multi-line order summary for the WhatsApp hand-off. One block
 * per line item, blank line between blocks, total + attribution at the end.
 * The total is computed here so it can never disagree with the listed lines.
 * Each item needs { title, medium, dimensions, price }.
 */
export function buildOrderMessage(items) {
  const lines = [`Hi ${site.artistName}, I'd like to order the following:`, '']

  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.title}`)
    lines.push(`   ${it.medium} · ${it.dimensions}`)
    lines.push(`   ${formatPrice(it.price)}`)
    lines.push('')
  })

  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  lines.push(`Order total: ${formatPrice(total)} for ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`)
  lines.push('')
  lines.push(`Sent from ${site.artistName}'s catalogue`)

  return lines.join('\n')
}

// wa.me deep link with the order pre-filled. encodeURIComponent handles the
// newlines (%0A) and characters like ·, ×, & in titles.
export function buildWhatsappUrl(items) {
  const number = String(site.whatsapp || '').replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(items))}`
}
