import gsap from 'gsap'

/** Subtle 3D tilt following the pointer. Returns a cleanup function. */
export function attachTilt(el, { max = 6, scale = 1.02, reduced = false } = {}) {
  if (!el || reduced) return () => {}

  const quickX = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power2.out' })
  const quickY = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power2.out' })
  const quickScale = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power2.out' })

  const onMove = (e) => {
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    quickX(px * max * 2)
    quickY(py * -max * 2)
    quickScale(scale)
  }
  const onLeave = () => {
    quickX(0)
    quickY(0)
    quickScale(1)
  }

  el.style.transformPerspective = '800px'
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  }
}

/** Magnetic pull toward the cursor for small controls (buttons, nav links). */
export function attachMagnetic(el, { strength = 0.35, reduced = false } = {}) {
  if (!el || reduced) return () => {}

  const quickX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
  const quickY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

  const onMove = (e) => {
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    quickX(relX * strength)
    quickY(relY * strength)
  }
  const onLeave = () => {
    quickX(0)
    quickY(0)
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  }
}
