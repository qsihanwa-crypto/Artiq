import gsap from 'gsap'
import { EASE } from './easing'

/**
 * Cinematic but short hero entrance. Never blocks interaction — every element
 * is already in the DOM and focusable/clickable before this timeline finishes.
 * `fragments` is the drifting artwork cluster, `blob` the faint grey backdrop.
 */
export function playHeroEntrance({ kicker, lines, subtext, ctas, blob, fragments, signature }, reduced) {
  const tl = gsap.timeline({ defaults: { ease: EASE.strong } })
  const frags = (fragments || []).filter(Boolean)

  if (reduced) {
    gsap.set([kicker, lines, subtext, ctas, blob, ...frags].filter(Boolean).flat(), {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      clearProps: 'transform',
    })
    if (signature) gsap.set(signature, { strokeDashoffset: 0 })
    return tl
  }

  if (blob) {
    tl.from(blob, { opacity: 0, scale: 1.08, duration: 1.4, ease: EASE.soft }, 0)
  }
  if (kicker) {
    tl.from(kicker, { opacity: 0, y: 12, duration: 0.5 }, 0.05)
  }
  if (lines?.length) {
    tl.from(
      lines,
      { opacity: 0, yPercent: 110, duration: 0.75, stagger: 0.09 },
      kicker ? '-=0.25' : 0,
    )
  }
  if (subtext) {
    tl.from(subtext, { opacity: 0, y: 16, duration: 0.55 }, '-=0.35')
  }
  if (ctas) {
    tl.from(ctas, { opacity: 0, y: 14, duration: 0.5, stagger: 0.08 }, '-=0.3')
  }
  if (signature) {
    tl.fromTo(signature, { strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1.2, ease: EASE.inOut }, '-=0.4')
  }
  if (frags.length) {
    tl.from(
      frags,
      { opacity: 0, scale: 0.92, y: 18, duration: 0.9, ease: EASE.expo, stagger: 0.08 },
      '-=1',
    )
  }

  return tl
}

/**
 * Slow, always-on drift for the hero backdrop — a faint grey blob and the
 * artwork fragments around it. Restrained by design: low amplitude, long
 * periods, independent so nothing ever syncs. No-op under reduced motion.
 * The tweens must be created inside a gsap.context() so ctx.revert() stops
 * them on unmount.
 */
export function startHeroAmbient({ blob, fragments }, reduced) {
  if (reduced) return

  const frags = (fragments || []).filter(Boolean)
  frags.forEach((el, i) => {
    gsap.to(el, {
      yPercent: `+=${6 + i * 2}`,
      rotation: `+=${i % 2 ? 2 : -2}`,
      duration: 7 + i * 1.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  })

  if (blob) {
    gsap.to(blob, {
      xPercent: 6,
      yPercent: -8,
      scale: 1.06,
      duration: 22,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
    gsap.to(blob, { rotation: 360, duration: 90, ease: 'none', repeat: -1 })
  }
}
