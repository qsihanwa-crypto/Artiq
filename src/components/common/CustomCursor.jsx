import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const LABELS = { view: 'View', drag: 'Drag', click: 'Click', flip: 'Flip' }

/**
 * Desktop-only decorative cursor. Never required to use the site: it only
 * layers a label on top of elements that already communicate their own
 * action via visible text/labels.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const labelRef = useRef(null)
  const [mode, setMode] = useState(null)
  const isTouch = useIsTouchDevice()
  const reduced = useReducedMotion()
  const disabled = isTouch || reduced

  useEffect(() => {
    if (disabled) return

    const dot = dotRef.current
    const label = labelRef.current
    const moveDot = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' })
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' })
    const scaleDot = gsap.quickTo(dot, 'scale', { duration: 0.2, ease: 'power2.out' })
    const moveLabel = gsap.quickTo(label, 'x', { duration: 0.22, ease: 'power3.out' })
    const moveLabelY = gsap.quickTo(label, 'y', { duration: 0.22, ease: 'power3.out' })

    const onMove = (e) => {
      moveDot(e.clientX)
      moveDotY(e.clientY)
      moveLabel(e.clientX)
      moveLabelY(e.clientY)
    }

    const onOver = (e) => {
      const target = e.target.closest?.('[data-cursor]')
      const nextMode = target ? target.getAttribute('data-cursor') : null
      setMode(nextMode)
      scaleDot(nextMode ? 1 : 0.22)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div
        ref={labelRef}
        className="cursor-label hidden md:flex"
        style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32, opacity: mode ? 1 : 0 }}
      >
        {mode ? LABELS[mode] || '' : ''}
      </div>
    </>
  )
}
