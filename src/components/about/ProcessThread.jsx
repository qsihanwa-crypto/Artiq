import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { drawLineOnScroll } from '../../animations/scrollAnimations'
import { attachTilt } from '../../animations/microInteractions'
import { EASE } from '../../animations/easing'
import WavyLine from '../common/WavyLine'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'

/**
 * ProcessThread — the About page "Creative Process" steps, threaded onto the
 * site's signature line. The ink line draws itself as the section scrolls in
 * (reusing <WavyLine>); a colour layer sits exactly on top of it and fills in
 * on scrub, its gradient built only from the steps' artwork palettes so the
 * page stays monochrome everywhere else. Each node pops and lights an
 * artwork-coloured dot as it enters view, then reveals its thumbnail and text.
 *
 * Reduced motion: no timelines — the line renders complete and every node is
 * shown in its final state. Content and order never depend on motion.
 */

// Kept identical to WavyLine's PATHS so the colour layer overlaps the ink line.
const PATH = {
  horizontal: 'M 0 60 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1150 100, 1200 55',
  vertical: 'M 40 0 C 90 150, 0 300, 60 450 S 20 700, 50 820',
}

export default function ProcessThread({ steps = [] }) {
  const rootRef = useRef(null)
  const nodeRefs = useRef([])
  const thumbRefs = useRef([])
  const huePathRef = useRef(null)
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()

  const gradientId = useMemo(() => `process-hue-${Math.random().toString(36).slice(2, 9)}`, [])

  const [vertical, setVertical] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = (event) => setVertical(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      drawLineOnScroll(huePathRef.current, {
        reduced,
        trigger: rootRef.current,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.7,
      })

      nodeRefs.current.filter(Boolean).forEach((node) => {
        const badge = node.querySelector('[data-node-badge]')
        const dot = node.querySelector('[data-node-dot]')
        const body = node.querySelectorAll('[data-node-reveal]')

        if (reduced) {
          gsap.set([badge, dot, ...body], { opacity: 1, scale: 1, y: 0 })
          return
        }

        gsap.set(dot, { opacity: 0, scale: 0 })
        gsap.set(body, { opacity: 0, y: 18 })

        gsap
          .timeline({ scrollTrigger: { trigger: node, start: 'top 78%', toggleActions: 'play none none reverse' } })
          .fromTo(badge, { scale: 1 }, { scale: 1.1, duration: 0.22, ease: EASE.soft, yoyo: true, repeat: 1 }, 0)
          .to(dot, { opacity: 1, scale: 1, duration: 0.4, ease: EASE.expo }, 0.05)
          .to(body, { opacity: 1, y: 0, duration: 0.55, ease: EASE.strong, stagger: 0.06 }, 0.05)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced, vertical, steps.length])

  useLayoutEffect(() => {
    if (reduced || isTouch) return undefined
    const cleanups = thumbRefs.current
      .filter(Boolean)
      .map((el) => attachTilt(el, { max: 6, scale: 1.03, reduced }))
    return () => cleanups.forEach((fn) => fn())
  }, [reduced, isTouch, steps.length])

  const lastIndex = Math.max(steps.length - 1, 1)

  return (
    <div ref={rootRef} className="relative mt-16">
      {/* the thread: ink signature line + a colour layer drawn on scroll, behind the nodes */}
      <div
        aria-hidden="true"
        className={
          vertical
            ? 'pointer-events-none absolute bottom-0 left-0 top-0 w-14'
            : 'pointer-events-none absolute inset-x-0 top-0 hidden h-14 sm:block'
        }
      >
        <WavyLine
          key={vertical ? 'v' : 'h'}
          variant={vertical ? 'vertical' : 'horizontal'}
          className="absolute inset-0 h-full w-full"
          opacity={0.2}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={vertical ? '0 0 100 850' : '0 0 1200 120'}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
              {steps.map((step, i) => (
                <stop key={step.label} offset={`${(i / lastIndex) * 100}%`} stopColor={step.accent} />
              ))}
            </linearGradient>
          </defs>
          <path
            ref={huePathRef}
            d={vertical ? PATH.vertical : PATH.horizontal}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={vertical ? 2.5 : 2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0.85 }}
          />
        </svg>
      </div>

      <ol className="relative z-10 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {steps.map((step, i) => (
          <li
            key={step.label}
            ref={(el) => {
              if (el) nodeRefs.current[i] = el
            }}
            className="relative flex flex-1 items-start gap-4 sm:flex-col sm:items-center sm:text-center"
          >
            <div className="relative shrink-0">
              <span
                data-node-badge
                className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg font-semibold text-white"
              >
                {i + 1}
              </span>
              <span
                data-node-dot
                aria-hidden="true"
                className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ring-2 ring-white"
                style={{ backgroundColor: step.accent }}
              />
            </div>

            <div className="flex flex-col gap-3 sm:items-center">
              <h3 data-node-reveal className="font-display text-lg font-semibold text-ink">
                {step.label}
              </h3>
              <p data-node-reveal className="max-w-[200px] text-sm text-neutral-600">
                {step.text}
              </p>
              {step.art && (
                <div
                  data-node-reveal
                  ref={(el) => {
                    if (el) thumbRefs.current[i] = el
                  }}
                  className="mt-1 w-full max-w-[150px] overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_16px_40px_-16px_rgba(10,10,10,0.28)]"
                >
                  <img src={step.art.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
