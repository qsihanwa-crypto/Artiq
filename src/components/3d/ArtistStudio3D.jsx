import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const StudioCanvas = lazy(() => import('./StudioCanvas'))

/**
 * The artist's studio — a minimal 3D diorama (easel, palette, brush, floating
 * artwork). Decorative/atmospheric only, never required to understand or use
 * the site. Mounts the WebGL scene only once scrolled into view, and swaps to
 * a static, lightweight illustration under prefers-reduced-motion or if
 * WebGL isn't available — a graceful, honest fallback rather than a blank gap.
 */
export default function ArtistStudio3D({ canvasArt, floatingArt, paletteColors }) {
  const wrapRef = useRef(null)
  const [inView, setInView] = useState(false)
  const reduced = useReducedMotion()
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!ctx) setWebglOk(false)
    } catch {
      setWebglOk(false)
    }
  }, [])

  const showFallback = reduced || !webglOk

  return (
    <div ref={wrapRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-neutral-50 sm:aspect-[16/9]">
      {showFallback ? (
        <StudioFallback canvasArt={canvasArt} />
      ) : inView ? (
        <Suspense fallback={<StudioFallback canvasArt={canvasArt} loading />}>
          <StudioCanvas canvasArt={canvasArt} floatingArt={floatingArt} paletteColors={paletteColors} reduced={reduced} />
        </Suspense>
      ) : (
        <StudioFallback canvasArt={canvasArt} loading />
      )}
    </div>
  )
}

function StudioFallback({ canvasArt, loading = false }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-6 p-8" role="img" aria-label="Illustration of the artist's studio: an easel holding a canvas, a palette, and a paintbrush">
      <div className="h-40 w-32 -rotate-2 overflow-hidden rounded-md border-4 border-white bg-neutral-100 shadow-lg sm:h-56 sm:w-44">
        <img src={canvasArt.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full border border-neutral-300 bg-[#f4f1ea] sm:h-20 sm:w-20" />
        <div className="h-1.5 w-20 rotate-45 rounded-full bg-ink/80" />
      </div>
      {loading && <span className="sr-only">Loading 3D studio scene…</span>}
    </div>
  )
}
