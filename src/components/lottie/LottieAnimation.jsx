import Lottie from 'lottie-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Thin, consistent wrapper around lottie-react. Always decorative
 * (aria-hidden) — never the sole carrier of information. Under
 * prefers-reduced-motion it renders the animation's first frame only.
 */
export default function LottieAnimation({ animationData, loop = true, className = '', style }) {
  const reduced = useReducedMotion()

  return (
    <div className={className} style={style} aria-hidden="true">
      <Lottie animationData={animationData} loop={!reduced && loop} autoplay={!reduced} />
    </div>
  )
}
