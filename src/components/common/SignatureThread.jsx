import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from '../../animations/scrollAnimations'
import { buildThreadPath, RAINBOW_STOPS } from '../../animations/signatureThread'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** Home's sections are direct children of <main> (the page renders a fragment). */
function measureSections(vw) {
  return Array.from(document.querySelectorAll('#main-content > section')).map((el) => {
    const rect = el.getBoundingClientRect()
    const content = el.querySelector(':scope > [class*="mx-auto"]') || el.querySelector('[class*="mx-auto"]')
    const box = content ? content.getBoundingClientRect() : null
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      contentLeft: box ? box.left : vw * 0.1,
      contentRight: box ? box.right : vw * 0.9,
    }
  })
}

/**
 * SignatureThread — a single rainbow line behind the whole Home page. It parks
 * in the gutter beside each section and sweeps side to side across the
 * whitespace between them, drawing itself in and riding the page as you scroll.
 *
 * Pure decoration: fixed, aria-hidden, pointer-events-none, sits behind all
 * content (the shell div is `isolate` so this layer's negative z-index resolves
 * against it), adds nothing focusable, never shifts layout. Under reduced motion
 * it renders fully drawn and static and only tracks scroll position — no scrub,
 * no draw-on, no gradient flow.
 */
export default function SignatureThread() {
  const reduced = useReducedMotion()
  const wrapRef = useRef(null)
  const groupRef = useRef(null)
  const lineRef = useRef(null)
  const gradRef = useRef(null)

  useLayoutEffect(() => {
    const line = lineRef.current
    const group = groupRef.current
    if (!line || !group) return undefined

    // Rebuild the route for the current page height / width. Runs on mount and
    // before every ScrollTrigger refresh, so the line stays correct as images,
    // the spiral and the flip cards settle, or on resize.
    const rebuild = () => {
      if (!lineRef.current) return
      const pageHeight = document.documentElement.scrollHeight
      const vw = window.innerWidth
      const { d } = buildThreadPath(measureSections(vw), { vw, pageHeight })
      lineRef.current.setAttribute('d', d)
      if (gradRef.current) gradRef.current.setAttribute('y2', String(pageHeight))
      gsap.set(lineRef.current, { strokeDasharray: reduced ? 'none' : lineRef.current.getTotalLength() })
    }

    rebuild()

    if (reduced) {
      gsap.set(line, { strokeDashoffset: 0 })
      const onScroll = () => gsap.set(group, { y: -window.scrollY })
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', rebuild)
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', rebuild)
      }
    }

    const ctx = gsap.context(() => {
      const pageScrub = {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      }

      gsap.fromTo(
        line,
        { strokeDashoffset: () => line.getTotalLength() },
        { strokeDashoffset: 0, ease: 'none', scrollTrigger: pageScrub },
      )
      gsap.fromTo(
        group,
        { y: 0 },
        {
          y: () => -Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
          ease: 'none',
          scrollTrigger: pageScrub,
        },
      )

      if (gradRef.current) {
        gsap.to(gradRef.current, {
          attr: { gradientTransform: 'translate(0 -260)' },
          duration: 8,
          ease: 'none',
          repeat: -1,
        })
      }
    }, wrapRef)

    ScrollTrigger.addEventListener('refreshInit', rebuild)
    const kicks = [
      requestAnimationFrame(() => ScrollTrigger.refresh()),
      setTimeout(() => ScrollTrigger.refresh(), 400),
    ]
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', rebuild)
      cancelAnimationFrame(kicks[0])
      clearTimeout(kicks[1])
      window.removeEventListener('load', onLoad)
      ctx.revert()
    }
  }, [reduced])

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient
            ref={gradRef}
            id="thread-rainbow"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2="3000"
            gradientTransform="translate(0 0)"
          >
            {RAINBOW_STOPS.map((colour, i) => (
              <stop key={i} offset={`${(i / (RAINBOW_STOPS.length - 1)) * 100}%`} stopColor={colour} />
            ))}
          </linearGradient>
        </defs>
        <g ref={groupRef} style={{ willChange: 'transform' }}>
          <path ref={lineRef} className="thread-line" stroke="url(#thread-rainbow)" d="M 0 0" />
        </g>
      </svg>
    </div>
  )
}
