import { useEffect, useRef } from 'react'
import { attachTilt } from '../../animations/microInteractions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import { formatPrice } from '../../utils/formatPrice'
import AddToCartButton from '../cart/AddToCartButton'

export function artworkMeta(artwork) {
  const size = artwork.dimensions && artwork.dimensions !== 'Dimensions on request'
    ? artwork.dimensions
    : 'Size on request'
  const year = artwork.year || 'Year not provided'
  return [artwork.medium || 'Medium not provided', size, year].join(' · ')
}

export function artworkPrice(artwork) {
  return artwork.status === 'sold' ? 'Sold' : formatPrice(artwork.price)
}

export function artworkStatusLabel(artwork) {
  if (artwork.status === 'exhibition') return 'On show/exhibition purpose'
  if (artwork.status === 'sold' || artwork.available === false) return 'Sold'
  return 'On sale'
}

export default function ArtworkCard({ artwork, priority = false, tilt = true, className = '' }) {
  const cardRef = useRef(null)
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()
  const isSold = artwork.status === 'sold' || artwork.available === false

  useEffect(() => {
    if (!tilt) return
    return attachTilt(cardRef.current, { reduced: reduced || isTouch, max: 5, scale: 1.015 })
  }, [tilt, reduced, isTouch])

  return (
    <div className={`group ${className}`}>
      <div
        ref={cardRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-neutral-100"
      >
        {artwork.image ? (
          <img
            src={artwork.image}
            alt={artwork.alt}
            loading={priority ? 'eager' : 'lazy'}
            className={`h-full w-full object-cover transition-[filter,opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] ${isSold ? 'grayscale-[0.55] opacity-80' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">Image not provided</div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-display text-base font-medium text-zinc-950">{artwork.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{artworkMeta(artwork)}</p>
        <p className="mt-2 text-sm font-medium text-zinc-700">{artworkStatusLabel(artwork)}</p>
        {artworkStatusLabel(artwork) !== 'Sold' && (
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-950">{artworkPrice(artwork)}</p>
            <AddToCartButton artwork={artwork} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
