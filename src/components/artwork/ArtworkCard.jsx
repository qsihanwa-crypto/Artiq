import { useEffect, useRef } from 'react'
import { attachTilt } from '../../animations/microInteractions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import { formatPrice } from '../../utils/formatPrice'
import AddToCartButton from '../cart/AddToCartButton'

export function artworkMeta(artwork) {
  const size = artwork.dimensions && artwork.dimensions !== 'Dimensions on request' ? artwork.dimensions : ''
  return [artwork.medium, size, artwork.year].filter(Boolean).join(' · ')
}

export function artworkPrice(artwork) {
  return artwork.status === 'sold' ? 'Sold' : formatPrice(artwork.price)
}

const ASPECT = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[5/4]',
  square: 'aspect-square',
}

export default function ArtworkCard({ artwork, priority = false, tilt = true, className = '' }) {
  const cardRef = useRef(null)
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()

  useEffect(() => {
    if (!tilt) return
    return attachTilt(cardRef.current, { reduced: reduced || isTouch, max: 5, scale: 1.015 })
  }, [tilt, reduced, isTouch])

  return (
    <div className={`group ${className}`}>
      <div
        ref={cardRef}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative overflow-hidden rounded-2xl bg-neutral-100 ${ASPECT[artwork.aspect] || ASPECT.square}`}
      >
        <img
          src={artwork.image}
          alt={artwork.alt}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
        />
      </div>

      <div className="mt-3">
        <h3 className="font-display text-base font-medium text-zinc-950">{artwork.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{artworkMeta(artwork)}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-950">{artworkPrice(artwork)}</p>
          <AddToCartButton artwork={artwork} size="sm" />
        </div>
      </div>
    </div>
  )
}
