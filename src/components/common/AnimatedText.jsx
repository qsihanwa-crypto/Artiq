import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { revealWords } from '../../animations/scrollAnimations'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Scroll-triggered word-by-word reveal. Falls back to plain static text under
 * reduced motion — the text itself is always in the DOM, animation only
 * changes its opacity/position.
 */
export default function AnimatedText({ text, as: Tag = 'p', className = '', wordClassName = '' }) {
  const containerRef = useRef(null)
  const reduced = useReducedMotion()
  const words = text.split(' ')

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const wordEls = el.querySelectorAll('[data-word]')
    const ctx = gsap.context(() => revealWords(Array.from(wordEls), { reduced }), el)
    return () => ctx.revert()
  }, [reduced, text])

  return (
    <Tag ref={containerRef} data-animated-text className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className={`inline-block ${wordClassName}`}>
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
