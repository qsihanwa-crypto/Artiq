import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import Button from '../buttons/Button'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const VISIBLE_RANGE = 3 // items further than this from center are hidden for performance

function wrapDelta(delta, n) {
  // shortest signed distance around the loop
  let d = delta % n
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

/**
 * Physical, draggable 3D artwork carousel. Framed artwork floats in space,
 * center piece is the focus. Scroll/drag/swipe/buttons/keyboard all work;
 * only horizontal wheel input is captured so the page never loses normal
 * vertical scroll. Falls back to a plain, simplified prev/next slideshow
 * under prefers-reduced-motion.
 */
export default function Carousel3D({ artworks }) {
  const reduced = useReducedMotion()
  const n = artworks.length
  const stageRef = useRef(null)
  const posRef = useRef(0) // continuous float index — authoritative value between renders
  const [position, setPosition] = useState(0)
  const dragState = useRef(null)
  const settleTimeout = useRef(null)

  const activeIndex = Math.round(((position % n) + n) % n)

  const animateTo = useCallback(
    (target, duration = 0.7) => {
      gsap.killTweensOf(posRef)
      gsap.to(posRef, {
        current: target,
        duration: reduced ? 0.2 : duration,
        ease: 'power3.out',
        onUpdate: () => setPosition(posRef.current),
      })
    },
    [reduced],
  )

  const goTo = useCallback(
    (index) => {
      const delta = wrapDelta(index - posRef.current, n)
      animateTo(posRef.current + delta)
    },
    [animateTo, n],
  )

  const next = useCallback(() => goTo(Math.round(posRef.current) + 1), [goTo])
  const prev = useCallback(() => goTo(Math.round(posRef.current) - 1), [goTo])

  // Drag interaction
  const onPointerDown = (e) => {
    if (reduced) return
    stageRef.current?.setPointerCapture(e.pointerId)
    gsap.killTweensOf(posRef)
    dragState.current = { startX: e.clientX, startPos: posRef.current, lastX: e.clientX, lastT: performance.now(), velocity: 0 }
  }
  const onPointerMove = (e) => {
    const drag = dragState.current
    if (!drag) return
    const width = stageRef.current?.clientWidth || 1
    const deltaX = e.clientX - drag.startX
    const spacing = width * 0.34
    const newPos = drag.startPos - deltaX / spacing
    posRef.current = newPos
    setPosition(newPos)
    const now = performance.now()
    const dt = now - drag.lastT
    if (dt > 0) drag.velocity = (e.clientX - drag.lastX) / dt
    drag.lastX = e.clientX
    drag.lastT = now
  }
  const onPointerUp = () => {
    const drag = dragState.current
    if (!drag) return
    dragState.current = null
    const width = stageRef.current?.clientWidth || 1
    const spacing = width * 0.34
    const inertia = -drag.velocity * 140 // project momentum forward
    const projected = posRef.current + inertia / spacing
    animateTo(Math.round(projected), 0.6)
  }

  // Wheel: only horizontal input steers the carousel; vertical scroll always
  // passes through untouched so the page itself never gets stuck.
  const onWheel = (e) => {
    if (reduced) return
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
    if (!horizontal) return
    e.preventDefault()
    gsap.killTweensOf(posRef)
    const nextPos = posRef.current + e.deltaX / 300
    posRef.current = nextPos
    setPosition(nextPos)
    clearTimeout(settleTimeout.current)
    settleTimeout.current = setTimeout(() => animateTo(Math.round(posRef.current), 0.5), 140)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  }

  if (reduced) {
    const art = artworks[activeIndex]
    return (
      <div className="mx-auto max-w-xl text-center">
        <Link to={`/artwork/${art.id}`} data-cursor="view" className="block overflow-hidden rounded-2xl bg-neutral-100">
          <img src={art.image} alt={art.alt} className="aspect-[4/5] w-full object-cover" />
        </Link>
        <p className="mt-4 font-display text-lg font-medium text-ink">{art.title}</p>
        <p className="text-sm text-neutral-500">{art.medium}</p>
        <CarouselControls onPrev={prev} onNext={next} index={activeIndex} total={n} />
      </div>
    )
  }

  return (
    <div className="select-none">
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Artwork carousel, showing "${artworks[activeIndex].title}"`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="relative h-[420px] w-full cursor-grab touch-pan-y active:cursor-grabbing sm:h-[520px]"
        style={{ perspective: '1600px' }}
      >
        {artworks.map((art, i) => {
          const delta = wrapDelta(i - position, n)
          const absDelta = Math.abs(delta)
          if (absDelta > VISIBLE_RANGE) return null
          const x = delta * 62
          const z = -absDelta * 180
          const rotateY = -delta * 32
          const scale = 1 - absDelta * 0.16
          const opacity = 1 - absDelta * 0.32
          const isActive = delta === 0

          return (
            <Link
              key={art.id}
              to={`/artwork/${art.id}`}
              data-cursor={isActive ? 'view' : undefined}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              onClick={(e) => {
                if (!isActive) {
                  e.preventDefault()
                  goTo(i)
                }
              }}
              className="absolute left-1/2 top-1/2 block w-[220px] overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_20px_60px_rgba(10,10,10,0.12)] sm:w-[300px]"
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}%, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: Math.max(opacity, 0),
                zIndex: 100 - absDelta,
                pointerEvents: absDelta === 0 ? 'auto' : 'none',
              }}
            >
              <img src={art.image} alt={art.alt} loading={absDelta <= 1 ? 'eager' : 'lazy'} className="aspect-[4/5] w-full object-cover" draggable={false} />
            </Link>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="font-display text-lg font-medium text-ink">{artworks[activeIndex].title}</p>
        <p className="text-sm text-neutral-500">{artworks[activeIndex].medium}</p>
      </div>

      <CarouselControls onPrev={prev} onNext={next} index={activeIndex} total={n} />
    </div>
  )
}

function CarouselControls({ onPrev, onNext, index, total }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-xs text-neutral-500">Drag or scroll to explore</p>
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="md" onClick={onPrev} className="px-5 py-2.5 text-sm">
          <ArrowLeft size={16} aria-hidden="true" /> Previous artwork
        </Button>
        <span className="text-sm tabular-nums text-neutral-500">{index + 1} / {total}</span>
        <Button variant="secondary" size="md" onClick={onNext} className="px-5 py-2.5 text-sm">
          Next artwork <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
