import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Tasteful, non-looping success confirmation — a circle pop plus a drawn
 * checkmark. Plain SVG + CSS (no animation library needed for something this
 * small); respects prefers-reduced-motion by showing the settled end state.
 */
export default function SuccessCheck({ className = '' }) {
  const reduced = useReducedMotion()

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="#e7f6e9"
        style={reduced ? undefined : { transformOrigin: '60px 60px', animation: 'success-pop 0.5s cubic-bezier(0.23,1,0.32,1) both' }}
      />
      <path
        d="M38 61 L53 76 L84 42"
        fill="none"
        stroke="#13a484"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={
          reduced
            ? undefined
            : {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: 'success-draw 0.5s 0.25s cubic-bezier(0.65,0,0.35,1) forwards',
              }
        }
      />
    </svg>
  )
}
