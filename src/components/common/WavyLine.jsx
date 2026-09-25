import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { drawLineOnScroll } from '../../animations/scrollAnimations'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const PATHS = {
  horizontal: 'M 0 60 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1150 100, 1200 55',
  arc: 'M 0 10 C 300 140, 900 140, 1200 10',
  vertical: 'M 40 0 C 90 150, 0 300, 60 450 S 20 700, 50 820',
}

/**
 * The site's recurring signature motif — a thin black line that draws itself
 * as its section enters view. Decorative only: aria-hidden, never blocks content.
 */
export default function WavyLine({ variant = 'horizontal', className = '', color = 'text-ink', opacity = 0.25 }) {
  const pathRef = useRef(null)
  const wrapRef = useRef(null)
  const reduced = useReducedMotion()
  const isVertical = variant === 'vertical'

  useLayoutEffect(() => {
    if (!pathRef.current) return
    const ctx = gsap.context(() => {
      drawLineOnScroll(pathRef.current, { reduced, trigger: wrapRef.current })
    })
    return () => ctx.revert()
  }, [reduced, variant])

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none ${color} ${className}`} style={{ opacity }}>
      <svg
        viewBox={isVertical ? '0 0 100 850' : '0 0 1200 120'}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path ref={pathRef} d={PATHS[variant]} className="signature-line-path" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
