import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'

/**
 * The single add-to-cart control, used on catalogue grid cards (`size="sm"`)
 * and the artwork detail page (`size="lg"`). Renders its own native elements
 * rather than <Button> (which has no small size) so the compact variant can
 * still keep a 44px hit area. Three states: sold, already in cart, and add.
 * The icons are decorative — the text label carries the meaning.
 */

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
const SIZES = {
  sm: 'h-11 px-3.5 text-xs',
  lg: 'h-12 px-6 text-sm',
}

export default function AddToCartButton({ artwork, size = 'lg', className = '' }) {
  const { add, isInCart } = useCart()
  const inCart = isInCart(artwork.id)
  const [added, setAdded] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const iconSize = size === 'sm' ? 14 : 16

  if (!artwork.available) {
    if (size === 'sm') return null
    return (
      <span
        className={`${BASE} ${SIZES[size]} cursor-not-allowed border border-neutral-300 text-neutral-400 ${className}`}
        aria-disabled="true"
      >
        Sold
      </span>
    )
  }

  if (inCart) {
    return (
      <Link
        to="/cart"
        aria-label="In cart — view cart"
        className={`${BASE} ${SIZES[size]} border border-ink text-ink hover:bg-black/5 ${className}`}
      >
        <Check size={iconSize} aria-hidden="true" />
        <span>In cart</span>
      </Link>
    )
  }

  const onAdd = () => {
    add(artwork)
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`${BASE} ${SIZES[size]} ${size === 'lg' ? 'w-full sm:w-auto ' : ''}bg-ink text-white hover:bg-ink-soft ${className}`}
    >
      <Plus size={iconSize} aria-hidden="true" />
      <span>{added ? 'Added' : 'Add to cart'}</span>
      <span aria-live="polite" className="sr-only">
        {added ? `Added ${artwork.title} to cart` : ''}
      </span>
    </button>
  )
}
