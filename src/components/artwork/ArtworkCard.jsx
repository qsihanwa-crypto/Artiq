import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { attachTilt } from '../../animations/microInteractions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'

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
        {/* Full-bleed link to the detail page — sits above the image, below the caption. */}
        <Link
          to={`/artwork/${artwork.id}`}
          data-cursor="view"
          aria-label={`View "${artwork.title}", ${artwork.medium}`}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
        />
        <img
          src={artwork.image}
          alt={artwork.alt}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
        />
        <div className="glass pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-4 py-3 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0">
          <p className="text-xs text-zinc-600">{artwork.medium}</p>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <Link
          to={`/artwork/${artwork.id}`}
          className="font-display text-base font-medium text-zinc-950 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {artwork.title}
        </Link>
        <p className="shrink-0 text-sm text-zinc-500">{artwork.categoryLabel}</p>
      </div>
    </div>
  )
}
