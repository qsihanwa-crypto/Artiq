import { useEffect, useRef, useState } from 'react'
import { Routes, useLocation } from 'react-router-dom'
import { coverTransition, revealTransition } from '../../animations/pageTransitions'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * White wipe + signature line between routes. Wraps <Routes> so it can hold
 * the previous page on screen for the ~300ms cover phase before swapping —
 * navigation itself is instant, only the visual crossfade is deferred.
 */
export default function PageTransition({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const overlayRef = useRef(null)
  const lineRef = useRef(null)
  const reduced = useReducedMotion()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    if (location.pathname === displayLocation.pathname) {
      setDisplayLocation(location)
      return
    }
    let cancelled = false
    coverTransition(overlayRef.current, lineRef.current, reduced).then(() => {
      if (cancelled) return
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
      setDisplayLocation(location)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    if (isFirst.current) return
    revealTransition(overlayRef.current, lineRef.current, reduced)
  }, [displayLocation, reduced])

  return (
    <>
      <Routes location={displayLocation}>{children}</Routes>
      <div ref={overlayRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150] hidden bg-white">
        <svg viewBox="0 0 1200 4" preserveAspectRatio="none" className="absolute top-1/2 h-1 w-full -translate-y-1/2 text-ink">
          <path ref={lineRef} d="M 0 2 L 1200 2" className="signature-line-path" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </>
  )
}
