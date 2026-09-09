// Data + helpers for <SignatureThread> — the Home-only rainbow line that
// threads down the page background.
//
// The line is *routed*, not waved: it parks in the gutter beside each measured
// section and makes its long side-to-side crossings in the whitespace between
// them, so it stays clear of the centred content columns and reads as a drawn
// stroke. Coordinates are CSS pixels (the host <svg> has no viewBox); the path
// is rebuilt on resize.

// Never let an anchor sit closer than this to the viewport edge.
const EDGE_PAD = 14
// A section whose content fills this much of the viewport counts as "wide":
// the lane is pushed out toward the edge so the line never crowds it.
const WIDE_RATIO = 0.78
const LANE_F_WIDE = 0.42
const LANE_F_NARROW = 0.78

const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value))

/**
 * Smooth cubic path through the given anchors (Catmull-Rom → Bézier).
 * Control-point y is clamped inside each segment so the path's y stays strictly
 * increasing as it descends the page. x is free to overshoot; that slight
 * overshoot on direction changes is what reads as drawn rather than plotted.
 */
function catmullRom(points, tension = 0.85) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || points[i + 1]
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension
    const c1y = clamp(p1.y + ((p2.y - p0.y) / 6) * tension, p1.y, p2.y)
    const c2y = clamp(p2.y - ((p3.y - p1.y) / 6) * tension, p1.y, p2.y)
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

/** Gentle full-height wave, used only if no sections could be measured. */
function fallbackPath(width, height) {
  const points = []
  const n = Math.max(3, Math.round(height / 800))
  for (let i = 0; i <= n; i++) {
    points.push({ x: width * (i % 2 ? 0.22 : 0.78), y: (height / n) * i })
  }
  return { d: catmullRom(points), points }
}

/**
 * Route the thread through the page.
 *
 * `sections` is measured DOM data: [{ top, bottom, contentLeft, contentRight }]
 * in document coordinates. Sides alternate right → left → right…; each section
 * gets a lane in its own gutter (closer to the edge beside wide/dense content,
 * further inward beside narrow text), and a crossing anchor is dropped at every
 * section boundary — which lands in the two sections' vertical padding, so the
 * sweep happens in open whitespace.
 */
export function buildThreadPath(sections, { vw, pageHeight } = {}) {
  const width = vw || 1280
  const height = pageHeight || 2000
  if (!sections?.length) return fallbackPath(width, height)

  const points = []
  let lastLane = width * 0.5

  sections.forEach((sec, i) => {
    const side = i % 2 === 0 ? 'right' : 'left'
    const h = Math.max(1, sec.bottom - sec.top)
    const contentW = Math.max(0, sec.contentRight - sec.contentLeft)
    const f = contentW / width >= WIDE_RATIO ? LANE_F_WIDE : LANE_F_NARROW
    const gutter = side === 'left' ? sec.contentLeft : width - sec.contentRight
    const laneX =
      side === 'left'
        ? clamp(gutter * f, EDGE_PAD, Math.max(EDGE_PAD, sec.contentLeft))
        : clamp(width - gutter * f, Math.min(width - EDGE_PAD, sec.contentRight), width - EDGE_PAD)
    // Mid-run drift toward centre. Kept small on narrow screens, where the
    // content box reaches almost to the edge and there is no gutter to spare.
    const inward = (side === 'left' ? 1 : -1) * (width < 640 ? 8 : 26)

    // The sweep: cross the page in the whitespace at this section's top edge.
    if (i > 0) points.push({ x: width * 0.5, y: sec.top })

    points.push({ x: laneX, y: sec.top + h * 0.18 })
    points.push({ x: laneX + inward, y: sec.top + h * 0.55 })
    points.push({ x: laneX, y: sec.bottom - h * 0.1 })
    lastLane = laneX
  })

  // Run off both ends rather than starting and stopping in mid-air.
  points.unshift({ x: points[0].x, y: -40 })
  points.push({ x: lastLane, y: height + 40 })

  // Guarantee strictly increasing y (degenerate/overlapping rects).
  for (let i = 1; i < points.length; i++) {
    if (points[i].y <= points[i - 1].y) points[i].y = points[i - 1].y + 1
  }

  return { d: catmullRom(points), points }
}

// 7 stops around the hue wheel (loops back to red so the flow tween is seamless).
export const RAINBOW_STOPS = ['#e63946', '#f77f00', '#ffd166', '#06d6a0', '#3a86ff', '#7209b7', '#e63946']
