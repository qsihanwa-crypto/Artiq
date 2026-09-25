import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { attachTilt } from '../../animations/microInteractions'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import './SteadyCard.css'

/**
 * SteadyCard — one "What steadies the work" card. The whole card is a button that
 * flips (real 3D rotateY) from the short label to a longer first-person note.
 * The Colour card flips instead to a strip of real artwork palettes — the
 * page's one sanctioned burst of hue.
 *
 * Full parity everywhere: keyboard-operable button with a two-state label and
 * an aria-live announcement; under prefers-reduced-motion the flip becomes an
 * instant face swap with no rotation, no tilt, and no interactive-hint nudge.
 */
export default function SteadyCard({ item }) {
  const [flipped, setFlipped] = useState(false)
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()
  const rootRef = useRef(null)
  const tiltRef = useRef(null)

  const isColour = item.swatches?.length > 0

  // Pointer tilt on the un-flipped card — desktop, motion on.
  useEffect(() => {
    const el = tiltRef.current
    if (reduced || isTouch || flipped || !el) return undefined
    const cleanup = attachTilt(el, { max: 8, scale: 1.02, reduced })
    return () => {
      cleanup()
      gsap.set(el, { rotateX: 0, rotateY: 0, scale: 1 })
    }
  }, [reduced, isTouch, flipped])

  // One-time "this flips" hint on the Colour card when it first scrolls into view.
  useEffect(() => {
    const el = rootRef.current
    if (reduced || isTouch || !isColour || !el) return undefined
    let played = false
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || played) return
          played = true
          el.classList.add('sc-peek')
          window.setTimeout(() => el.classList.remove('sc-peek'), 950)
          io.disconnect()
        })
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, isTouch, isColour])

  const label = flipped
    ? `${item.title}. Showing more — activate to show the front of the card.`
    : `${item.title}. Activate to read more.`

  return (
    <div ref={rootRef} className="sc-root" style={{ perspective: '1400px' }}>
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-pressed={flipped}
        aria-label={label}
        data-cursor="flip"
        className="relative block w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {reduced ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
            {flipped ? <BackFace item={item} isColour={isColour} /> : <FrontFace item={item} />}
          </div>
        ) : (
          <div className="relative aspect-[4/5] w-full">
            <div ref={tiltRef} className="sc-tilt">
              <div className={`sc-flip${flipped ? ' is-flipped' : ''}`}>
                <div className="sc-face">
                  <FrontFace item={item} />
                </div>
                <div className="sc-face sc-face--back">
                  <BackFace item={item} isColour={isColour} />
                </div>
              </div>
            </div>
          </div>
        )}
      </button>

      <span className="sr-only" aria-live="polite">
        {flipped ? `${item.title}: ${isColour ? 'colour palettes' : 'more'} shown.` : ''}
      </span>
    </div>
  )
}

function FrontFace({ item }) {
  return (
    <div className="glass flex h-full w-full flex-col justify-between rounded-2xl p-6">
      <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
      <p className="text-neutral-600">{item.body}</p>
      <span aria-hidden="true" className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
        Read more →
      </span>
    </div>
  )
}

function BackFace({ item, isColour }) {
  if (isColour) {
    return (
      <div className="glass-strong flex h-full w-full flex-col rounded-2xl p-5">
        <h3 className="font-display text-base font-semibold text-ink">Colour first</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{`“${item.insight}”`}</p>
        <ul className="mt-4 flex flex-1 flex-col justify-center gap-2.5">
          {item.swatches.map((swatch) => (
            <li key={swatch.id} className="flex items-center gap-3">
              <span className="flex shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">
                {swatch.palette.map((colour, i) => (
                  <span key={i} className="h-6 w-6" style={{ backgroundColor: colour }} />
                ))}
              </span>
              <span className="truncate text-[11px] font-medium text-neutral-500">{swatch.title}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="glass-strong flex h-full w-full flex-col rounded-2xl">
      {item.art && (
        <div className="h-[44%] shrink-0 overflow-hidden bg-neutral-100">
          <img src={item.art.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <p className="text-[15px] leading-relaxed text-neutral-700">{`“${item.insight}”`}</p>
        <span aria-hidden="true" className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
          ← Back
        </span>
      </div>
    </div>
  )
}
