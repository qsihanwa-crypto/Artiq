import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ArtworkCard from '../artwork/ArtworkCard'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function MasonryGallery({ artworks }) {
  const gridRef = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const items = el.querySelectorAll('[data-gallery-item]')
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04 },
      )
    }, el)
    return () => ctx.revert()
  }, [artworks, reduced])

  if (artworks.length === 0) {
    return (
      <div className="glass rounded-3xl px-8 py-20 text-center">
        <p className="text-lg font-medium text-zinc-950">No artwork matches these filters yet.</p>
        <p className="mt-2 text-zinc-500">Try a different category or year.</p>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((art) => (
        <div key={art.id} data-gallery-item>
          <ArtworkCard artwork={art} />
        </div>
      ))}
    </div>
  )
}
