import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import { attachTilt } from '../../animations/microInteractions'
import './DetailToWhole.css'

/**
 * DetailToWhole — the Interact section's flip cards.
 *
 * Each card starts on a close-up detail and flips (real 3D rotateY) to the
 * whole work plus a first-person note. A short depth stack of the next
 * pieces sits behind the active card. Every path has a plain equivalent:
 * the whole card is a flip button, and there is a labelled "Show the full
 * work" button plus real Previous / Next buttons and left/right arrow keys.
 * Under prefers-reduced-motion the flip becomes an instant face swap and the
 * pointer tilt is dropped — content and navigation are unchanged.
 */

// offset 0 = active card, 1..2 = the next pieces peeking out from under it.
const STACK = [
  { y: 0, z: 0, scale: 1, opacity: 1, blur: 0, zIndex: 30 },
  { y: 14, z: -110, scale: 0.95, opacity: 0.55, blur: 1.5, zIndex: 20 },
  { y: 26, z: -220, scale: 0.9, opacity: 0.28, blur: 3, zIndex: 10 },
]

export default function DetailToWhole({ pieces = [] }) {
  const n = pieces.length
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()

  const go = useCallback(
    (dir) => {
      setFlipped(false)
      setIndex((i) => (i + dir + n) % n)
    },
    [n],
  )

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
  }

  if (n === 0) return null
  const active = pieces[index]

  return (
    <div
      className="glass rounded-3xl p-6 sm:p-10"
      role="group"
      aria-roledescription="carousel"
      aria-label="How I See — a detail from each piece, flip a card to see the whole work"
      onKeyDown={onKeyDown}
    >
      <div className="d2w-stage mx-auto h-[500px] w-full sm:h-[600px]">
        {pieces.map((piece, i) => {
          const offset = (i - index + n) % n
          return (
            <FlipCard
              key={piece.id}
              piece={piece}
              offset={offset}
              isActive={offset === 0}
              flipped={offset === 0 && flipped}
              onFlip={() => setFlipped((f) => !f)}
              reduced={reduced}
              isTouch={isTouch}
            />
          )
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-ink-soft active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {flipped ? 'Show the detail' : 'Show the full work'}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span>Previous</span>
          </button>
          <p className="min-w-[3.25rem] text-center text-sm font-medium tabular-nums text-neutral-500">
            {index + 1} <span className="text-neutral-300">/</span> {n}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span>Next</span>
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </div>

        <p className="max-w-sm text-center text-xs leading-relaxed text-neutral-400">
          Tap a card to flip it. Use the buttons or your left and right arrow keys to move between pieces.
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Piece ${index + 1} of ${n}: ${active.title}, ${active.medium}. ${
          flipped ? 'Showing the whole work and the artist’s note.' : 'Showing a detail.'
        }`}
      </p>
    </div>
  )
}

function FlipCard({ piece, offset, isActive, flipped, onFlip, reduced, isTouch }) {
  const tiltRef = useRef(null)
  const style = STACK[Math.min(offset, STACK.length - 1)]
  const hidden = offset >= STACK.length

  useEffect(() => {
    if (!isActive || reduced || isTouch) return undefined
    return attachTilt(tiltRef.current, { max: 7, scale: 1, reduced })
  }, [isActive, reduced, isTouch])

  return (
    <div
      className="d2w-card"
      aria-hidden={!isActive}
      style={{
        transform: `translate(-50%, calc(-50% + ${style.y}px)) translateZ(${style.z}px) scale(${style.scale})`,
        opacity: hidden ? 0 : style.opacity,
        filter: style.blur ? `blur(${style.blur}px)` : 'none',
        zIndex: hidden ? 0 : style.zIndex,
        visibility: hidden ? 'hidden' : 'visible',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="d2w-tilt" ref={tiltRef}>
        {reduced ? (
          <div className="d2w-face">{flipped ? <BackFace piece={piece} /> : <FrontFace piece={piece} />}</div>
        ) : (
          <div className={`d2w-flip${flipped ? ' is-flipped' : ''}`}>
            <div className="d2w-face d2w-face--front">
              <FrontFace piece={piece} />
            </div>
            <div className="d2w-face d2w-face--back">
              <BackFace piece={piece} />
            </div>
          </div>
        )}

        {isActive && (
          <button
            type="button"
            onClick={onFlip}
            aria-pressed={flipped}
            data-cursor="flip"
            aria-label={
              flipped
                ? `${piece.title}. Showing the whole work — activate to go back to the detail.`
                : `${piece.title}. Showing a detail — activate to see the whole work.`
            }
            className="absolute inset-0 z-20 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          />
        )}
      </div>
    </div>
  )
}

function FrontFace({ piece }) {
  const src = piece.closeUpImage || piece.fullImage
  const zoomStyle = piece.closeUpImage
    ? undefined
    : { transform: `scale(${piece.focal.scale})`, transformOrigin: `${piece.focal.x}% ${piece.focal.y}%` }

  return (
    <>
      <img
        className="d2w-zoom"
        src={src}
        alt={`A close-up detail from “${piece.title}”`}
        style={zoomStyle}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
      <span className="glass-pill absolute left-4 top-4 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
        Detail
      </span>
      <span className="glass-pill absolute right-4 top-4 px-3 py-1 text-[11px] font-medium text-ink">
        {piece.medium}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 pb-4 pt-10 text-center text-xs font-medium text-white/95"
      >
        Tap to reveal the full work
      </span>
    </>
  )
}

function BackFace({ piece }) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative h-[50%] shrink-0 overflow-hidden bg-neutral-100">
        <img
          src={piece.fullImage}
          alt={piece.alt}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-sm font-semibold tracking-tight text-ink">{piece.title}</p>
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {piece.medium}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-neutral-700 sm:text-[14.5px]">{piece.insight}</p>
        <span aria-hidden="true" className="mt-auto pt-2 text-[11px] text-neutral-400">
          Tap to go back to the detail
        </span>
      </div>
    </div>
  )
}
