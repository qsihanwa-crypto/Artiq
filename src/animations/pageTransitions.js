import gsap from 'gsap'
import { EASE } from './easing'

const COVER_MS = 0.32
const REVEAL_MS = 0.38

/** White wipe covers the viewport; resolves once fully covered. Fast — never blocks navigation feel. */
export function coverTransition(overlayEl, lineEl, reduced) {
  return new Promise((resolve) => {
    if (reduced || !overlayEl) {
      resolve()
      return
    }
    gsap.set(overlayEl, { transformOrigin: 'bottom', display: 'block' })
    const tl = gsap.timeline({ onComplete: resolve })
    tl.fromTo(overlayEl, { scaleY: 0 }, { scaleY: 1, duration: COVER_MS, ease: EASE.strong })
    if (lineEl) {
      const length = lineEl.getTotalLength?.() || 0
      gsap.set(lineEl, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
      tl.to(lineEl, { strokeDashoffset: 0, duration: COVER_MS * 0.9, ease: EASE.inOut }, 0)
    }
  })
}

/** White wipe uncovers the new page. */
export function revealTransition(overlayEl, lineEl, reduced) {
  if (reduced || !overlayEl) return
  gsap.set(overlayEl, { transformOrigin: 'top' })
  const tl = gsap.timeline({ onComplete: () => gsap.set(overlayEl, { display: 'none' }) })
  if (lineEl) {
    tl.to(lineEl, { opacity: 0, duration: 0.15 }, 0)
  }
  tl.to(overlayEl, { scaleY: 0, duration: REVEAL_MS, ease: EASE.strong }, 0.02)
}
