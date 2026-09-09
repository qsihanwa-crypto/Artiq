import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { site } from '../data/site'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import { buildOrderMessage, buildWhatsappUrl } from '../utils/whatsappOrder'
import Button from '../components/buttons/Button'
import SuccessCheck from '../components/common/SuccessCheck'

export default function Cart() {
  const { items, count, subtotal, remove, clear } = useCart()
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const headingRef = useRef(null)
  const sentHeadingRef = useRef(null)
  const listRef = useRef(null)
  const checkoutRef = useRef(null)
  const copyTimer = useRef(null)
  const pendingFocus = useRef(null)

  useEffect(() => () => clearTimeout(copyTimer.current), [])
  useEffect(() => {
    if (count === 0) setSubmitted(false)
  }, [count])
  useEffect(() => {
    if (submitted) sentHeadingRef.current?.focus()
  }, [submitted])

  // Move focus after a line item is removed and the list has re-rendered.
  useEffect(() => {
    if (pendingFocus.current == null) return
    const index = pendingFocus.current
    pendingFocus.current = null
    const buttons = listRef.current?.querySelectorAll('[data-remove]')
    if (buttons && buttons.length) {
      buttons[Math.min(index, buttons.length - 1)].focus()
    } else if (checkoutRef.current) {
      checkoutRef.current.focus()
    } else {
      headingRef.current?.focus()
    }
  }, [count])

  const openWhatsapp = () => window.open(buildWhatsappUrl(items), '_blank', 'noopener,noreferrer')

  const handleCheckout = () => {
    if (count === 0) return
    openWhatsapp()
    setSubmitted(true)
  }

  const handleCopy = async () => {
    const text = buildOrderMessage(items)
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      document.body.removeChild(ta)
    }
    setCopied(ok)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    clear()
    setSubmitted(false)
    setCopied(false)
  }

  const handleRemove = (id, index) => {
    pendingFocus.current = index
    remove(id)
  }

  const pieces = (n) => `${n} ${n === 1 ? 'piece' : 'pieces'}`

  return (
    <div className="px-6 pb-28 pt-32 sm:px-10 sm:pt-40">
      <section className="mx-auto max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Cart</span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink outline-none sm:text-6xl"
        >
          Your cart
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Reserve an original by {site.artistName}. Checkout opens a WhatsApp message with your list — I&rsquo;ll
          confirm it&rsquo;s still available and sort out payment and delivery with you directly.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        {count === 0 && !submitted ? (
          <div className="glass rounded-3xl px-8 py-20 text-center">
            <ShoppingBag size={28} className="mx-auto text-neutral-400" aria-hidden="true" />
            <p className="mt-4 text-lg font-medium text-ink">Your cart is empty.</p>
            <p className="mt-2 text-neutral-500">Add a piece from the collection to start an order.</p>
            <Button to="/catalogue" variant="primary" size="md" showArrow className="mt-8">
              Browse the collection
            </Button>
          </div>
        ) : (
          <>
            <ul ref={listRef} className="divide-y divide-neutral-200 border-y border-neutral-200">
              {items.map((item, index) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <img src={item.image} alt={item.alt} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/artwork/${item.id}`}
                      className="font-display text-base font-medium text-ink hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-neutral-500">
                      {item.medium} · {item.dimensions}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="whitespace-nowrap font-display text-sm font-medium text-ink">
                      {formatPrice(item.price)}
                    </p>
                    {!submitted && (
                      <button
                        type="button"
                        data-remove
                        onClick={() => handleRemove(item.id, index)}
                        className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-neutral-500 transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span>
                          Remove<span className="sr-only"> {item.title} from cart</span>
                        </span>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p aria-live="polite" className="sr-only">
              {pieces(count)} in your cart. Order total {formatPrice(subtotal)}.
            </p>

            {submitted ? (
              <div className="glass-strong mt-8 rounded-[2rem] p-8 text-center sm:p-10">
                <SuccessCheck className="mx-auto h-24 w-24" />
                <h2
                  ref={sentHeadingRef}
                  tabIndex={-1}
                  className="mt-2 font-display text-2xl font-semibold text-ink outline-none"
                >
                  WhatsApp opened.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-neutral-600">
                  Your order summary is ready in a new tab. Send it over and I&rsquo;ll take it from there — nothing
                  was charged, and your cart stays here until you clear it.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button variant="primary" size="md" onClick={openWhatsapp}>
                    Open WhatsApp again
                  </Button>
                  <Button variant="secondary" size="md" onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy order text'}
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleClear}>
                    Clear cart
                  </Button>
                </div>
                <p aria-live="polite" className="sr-only">
                  {copied ? 'Order text copied to clipboard' : ''}
                </p>
                <a
                  href={buildWhatsappUrl(items)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-sm text-neutral-500 underline hover:text-ink"
                >
                  Open the WhatsApp link manually
                </a>
              </div>
            ) : (
              <div className="glass-strong mt-8 rounded-[2rem] p-8">
                <div className="flex items-baseline justify-between">
                  <span className="text-neutral-600">Order total · {pieces(count)}</span>
                  <span className="font-display text-2xl font-semibold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-3 text-sm text-neutral-500">
                  Placed and paid through WhatsApp — nothing is charged on this site. I confirm the piece is
                  available and arrange payment and delivery with you directly.
                </p>
                <Button
                  ref={checkoutRef}
                  variant="primary"
                  size="lg"
                  showArrow
                  onClick={handleCheckout}
                  className="mt-6 w-full"
                >
                  Check out on WhatsApp
                </Button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 w-full rounded-full px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {copied ? 'Order text copied' : 'Copy order text instead'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
