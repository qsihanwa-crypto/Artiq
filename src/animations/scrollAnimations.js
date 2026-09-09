import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EASE } from './easing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/** Fade + rise reveal for a section as it enters the viewport. Runs once. */
export function revealOnScroll(target, { reduced, y = 28, stagger = 0, start = 'top 82%' } = {}) {
  if (!target) return null
  if (reduced) {
    gsap.set(target, { opacity: 1, y: 0 })
    return null
  }
  return gsap.fromTo(
    target,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: EASE.strong,
      stagger,
      scrollTrigger: { trigger: Array.isArray(target) ? target[0] : target, start, toggleActions: 'play none none reverse' },
    },
  )
}

/** Word-by-word reveal used by <AnimatedText>. */
export function revealWords(wordEls, { reduced, start = 'top 78%' } = {}) {
  if (!wordEls?.length) return null
  if (reduced) {
    gsap.set(wordEls, { opacity: 1, filter: 'none', y: 0 })
    return null
  }
  return gsap.fromTo(
    wordEls,
    { opacity: 0.12, y: 18, filter: 'blur(6px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.7,
      ease: EASE.soft,
      stagger: 0.045,
      scrollTrigger: { trigger: wordEls[0].closest('[data-animated-text]') || wordEls[0], start, toggleActions: 'play none none reverse' },
    },
  )
}

/**
 * Light parallax for decorative layers as a section scrolls out of view.
 * `layers` is [{ el, amount }] — `amount` is the yPercent drift (negative =
 * upward). One ScrollTrigger for the whole set; no pinning. No-op when reduced.
 */
export function parallaxOnScroll(layers, { reduced, trigger } = {}) {
  const items = (layers || []).filter((l) => l && l.el)
  if (!items.length || reduced) return null
  return items.map(({ el, amount }) =>
    gsap.to(el, {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger: trigger || el, start: 'top top', end: 'bottom top', scrub: 0.6 },
    }),
  )
}

/** Draws an SVG path (stroke-dasharray trick) as its container scrolls through the viewport. */
export function drawLineOnScroll(pathEl, { reduced, trigger, start = 'top 90%', end = 'bottom 60%', scrub = 0.6 } = {}) {
  if (!pathEl) return null
  const length = pathEl.getTotalLength()
  gsap.set(pathEl, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length })
  if (reduced) return null
  return gsap.to(pathEl, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: trigger || pathEl, start, end, scrub },
  })
}

export { ScrollTrigger }
