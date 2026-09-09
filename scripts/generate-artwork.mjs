// One-time generator for local placeholder artwork.
// Produces SVG files under src/assets/artwork/ and the matching src/data/artworks.js.
// Run with: node scripts/generate-artwork.mjs
// Replace generated files later with real artwork + edit artworks.js directly.

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ASSET_DIR = join(ROOT, 'src/assets/artwork')
const DATA_FILE = join(ROOT, 'src/data/artworks.js')

mkdirSync(ASSET_DIR, { recursive: true })

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COLOR_NAMES = {
  '#e63946': 'red', '#f1a208': 'amber', '#111111': 'ink black', '#3a86ff': 'blue',
  '#8338ec': 'violet', '#ff006e': 'magenta', '#2a9d8f': 'teal', '#e9c46a': 'gold',
  '#f4a261': 'sand orange', '#ffbe0b': 'amber', '#457b9d': 'slate blue', '#a8dadc': 'pale cyan',
  '#f72585': 'pink', '#7209b7': 'purple', '#4361ee': 'indigo', '#ffb703': 'gold',
  '#fb8500': 'orange', '#219ebc': 'cerulean', '#06d6a0': 'mint', '#118ab2': 'cerulean',
  '#ef476f': 'coral', '#e76f51': 'terracotta', '#264653': 'deep teal', '#ffd60a': 'yellow',
  '#8ecae6': 'sky blue', '#023047': 'navy', '#ff6d00': 'orange', '#003049': 'navy',
  '#d62828': 'crimson', '#f77f00': 'orange', '#4cc9f0': 'sky blue', '#fca311': 'amber',
  '#14213d': 'navy', '#e5e5e5': 'pale gray', '#ffd166': 'yellow', '#f1faee': 'ivory',
  '#ffffff': 'white',
}
const colorName = (hex) => COLOR_NAMES[hex] || 'color'

const ASPECT_DIMS = {
  portrait: [800, 1050],
  landscape: [1050, 800],
  square: [900, 900],
}

// ---- shape helpers -------------------------------------------------------

function blobPath(rng, cx, cy, r, irregularity = 0.35, points = 8) {
  const angleStep = (Math.PI * 2) / points
  const pts = []
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep
    const rad = r * (1 - irregularity / 2 + rng() * irregularity)
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad])
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `
  for (let i = 0; i < points; i++) {
    const p0 = pts[i]
    const p1 = pts[(i + 1) % points]
    const mx = (p0[0] + p1[0]) / 2
    const my = (p0[1] + p1[1]) / 2
    d += `Q ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} `
  }
  d += 'Z'
  return d
}

function strokePath(rng, x, y, len, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  const segments = 3 + Math.floor(rng() * 3)
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)} `
  let cx = x
  let cy = y
  for (let i = 0; i < segments; i++) {
    const step = len / segments
    const wob = (rng() - 0.5) * step * 0.6
    const nx = cx + Math.cos(rad) * step + Math.cos(rad + Math.PI / 2) * wob
    const ny = cy + Math.sin(rad) * step + Math.sin(rad + Math.PI / 2) * wob
    d += `Q ${(cx + nx) / 2} ${(cy + ny) / 2}, ${nx.toFixed(1)} ${ny.toFixed(1)} `
    cx = nx
    cy = ny
  }
  return d
}

// ---- category renderers ---------------------------------------------------

function renderPainting(seed, w, h, palette) {
  const rng = mulberry32(seed)
  let shapes = `<rect width="${w}" height="${h}" fill="#fdfcfb"/>`
  const blobCount = 5 + Math.floor(rng() * 3)
  for (let i = 0; i < blobCount; i++) {
    const color = palette[i % palette.length]
    const cx = rng() * w
    const cy = rng() * h
    const r = (0.22 + rng() * 0.24) * Math.max(w, h)
    const opacity = (0.45 + rng() * 0.3).toFixed(2)
    const rot = (rng() * 360).toFixed(1)
    shapes += `<path d="${blobPath(rng, cx, cy, r, 0.45, 7 + Math.floor(rng() * 3))}" fill="${color}" opacity="${opacity}" style="mix-blend-mode:multiply" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`
  }
  const strokeCount = 6 + Math.floor(rng() * 6)
  for (let i = 0; i < strokeCount; i++) {
    const x = rng() * w
    const y = rng() * h
    const len = (0.08 + rng() * 0.16) * Math.max(w, h)
    const angle = rng() * 360
    shapes += `<path d="${strokePath(rng, x, y, len, angle)}" fill="none" stroke="#0a0a0a" stroke-width="${(1.2 + rng() * 1.6).toFixed(1)}" stroke-linecap="round" opacity="${(0.06 + rng() * 0.1).toFixed(2)}"/>`
  }
  return shapes
}

function renderDrawing(seed, w, h, palette) {
  const rng = mulberry32(seed)
  let shapes = `<rect width="${w}" height="${h}" fill="#fafaf7"/>`
  const strokeCount = 22 + Math.floor(rng() * 16)
  for (let i = 0; i < strokeCount; i++) {
    const x = rng() * w
    const y = rng() * h
    const len = (0.06 + rng() * 0.22) * Math.max(w, h)
    const angle = rng() * 360
    const width = (0.8 + rng() * 2.2).toFixed(1)
    shapes += `<path d="${strokePath(rng, x, y, len, angle)}" fill="none" stroke="#111111" stroke-width="${width}" stroke-linecap="round" opacity="${(0.35 + rng() * 0.45).toFixed(2)}"/>`
  }
  const accentCount = 2 + Math.floor(rng() * 2)
  for (let i = 0; i < accentCount; i++) {
    const color = palette[(i + 1) % palette.length]
    const cx = rng() * w
    const cy = rng() * h
    const r = (0.1 + rng() * 0.14) * Math.max(w, h)
    shapes += `<path d="${blobPath(rng, cx, cy, r, 0.5, 6)}" fill="${color}" opacity="${(0.35 + rng() * 0.25).toFixed(2)}"/>`
  }
  return shapes
}

function renderDigital(seed, w, h, palette) {
  const rng = mulberry32(seed)
  const dark = rng() > 0.45
  const bg = dark ? '#0a0a0a' : '#fbfbfb'
  let defs = ''
  let shapes = `<rect width="${w}" height="${h}" fill="${bg}"/>`

  const gradCount = 2
  for (let i = 0; i < gradCount; i++) {
    const id = `g${seed}_${i}`
    const c1 = palette[i % palette.length]
    const c2 = palette[(i + 1) % palette.length]
    defs += `<radialGradient id="${id}" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </radialGradient>`
    const cx = rng() * w
    const cy = rng() * h
    const r = (0.3 + rng() * 0.25) * Math.max(w, h)
    shapes += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id})"/>`
  }

  const cols = 5 + Math.floor(rng() * 3)
  const rows = 5 + Math.floor(rng() * 3)
  const cellW = w / cols
  const cellH = h / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() > 0.62) continue
      const color = palette[Math.floor(rng() * palette.length)]
      const cx = c * cellW + cellW / 2
      const cy = r * cellH + cellH / 2
      const size = Math.min(cellW, cellH) * (0.14 + rng() * 0.22)
      const shape = rng()
      const opacity = (0.5 + rng() * 0.4).toFixed(2)
      if (shape < 0.4) {
        shapes += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${size.toFixed(1)}" fill="${color}" opacity="${opacity}"/>`
      } else if (shape < 0.75) {
        const rot = (rng() * 90).toFixed(1)
        shapes += `<rect x="${(cx - size).toFixed(1)}" y="${(cy - size).toFixed(1)}" width="${(size * 2).toFixed(1)}" height="${(size * 2).toFixed(1)}" fill="${color}" opacity="${opacity}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`
      } else {
        shapes += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${size.toFixed(1)}" fill="none" stroke="${color}" stroke-width="2" opacity="${opacity}"/>`
      }
    }
  }

  const lineColor = dark ? '#ffffff' : '#0a0a0a'
  for (let i = 0; i < 3; i++) {
    const y = rng() * h
    shapes += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}" stroke="${lineColor}" stroke-width="0.6" opacity="0.08"/>`
  }

  return `<defs>${defs}</defs>${shapes}`
}

const RENDERERS = { painting: renderPainting, drawing: renderDrawing, digital: renderDigital }

function buildSvg(category, seed, palette, aspect) {
  const [w, h] = ASPECT_DIMS[aspect]
  const inner = RENDERERS[category](seed, w, h, palette)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img">${inner}</svg>`
}

// ---- artwork catalogue (curated metadata) ---------------------------------

// price (whole RM), available, materials[] and technique are mock commerce
// metadata — same placeholder convention as the rest of this file. Keep them
// here so a regen re-emits them into src/data/artworks.js.
const PIGMENT_PRINT = ['Archival pigment print', 'Hahnemühle cotton paper', 'Certificate of authenticity']

const RAW = [
  { title: 'Untitled No. 01', year: 2024, medium: 'Acrylic on Canvas', category: 'painting', dims: '70 × 90 cm', aspect: 'portrait', palette: ['#e63946', '#f1a208', '#ffffff'], desc: 'Layered red and amber forms pushed across the canvas until they stopped looking like anything but themselves.', price: 3800, available: true, materials: ['Acrylic paint', 'Cotton canvas', 'Pine stretcher bars', 'Matte varnish'], technique: 'Built up in thin translucent acrylic glazes, then worked back with a palette knife' },
  { title: 'Quiet Static', year: 2023, medium: 'Charcoal on Paper', category: 'drawing', dims: '42 × 59 cm', aspect: 'portrait', palette: ['#111111', '#e63946'], desc: 'A study in repetition — the same gesture, drawn until it stopped feeling like a hand and started feeling like a rhythm.', price: 1100, available: true, materials: ['Compressed charcoal', 'Cotton rag paper', 'Workable fixative'], technique: 'Repeated directional strokes blended by hand and fixed in successive layers' },
  { title: 'Interior Weather', year: 2025, medium: 'Digital Painting', category: 'digital', dims: 'Variable / Digital', aspect: 'landscape', palette: ['#3a86ff', '#8338ec', '#ff006e'], desc: 'Built entirely on-screen, one soft gradient at a time, until the file felt like a room with its own light.', price: 1200, available: true, materials: PIGMENT_PRINT, technique: 'Digital painting composited from layered gradient passes' },
  { title: 'Bloomfield No. 2', year: 2022, medium: 'Oil on Canvas', category: 'painting', dims: '60 × 60 cm', aspect: 'square', palette: ['#2a9d8f', '#e9c46a', '#f4a261'], desc: 'Part of a series exploring how a single colour can carry an entire mood if you let it take up enough space.', price: 3000, available: false, materials: ['Oil paint', 'Linen canvas', 'Pine stretcher bars', 'Gesso ground'], technique: 'Alla prima oil layering worked wet-into-wet in a single session' },
  { title: 'Echo Chamber', year: 2024, medium: 'Ink on Paper', category: 'drawing', dims: '30 × 42 cm', aspect: 'portrait', palette: ['#111111', '#3a86ff'], desc: 'Line work that keeps folding back on itself, like a thought that will not resolve into a single sentence.', price: 850, available: true, materials: ['India ink', 'Heavyweight cartridge paper'], technique: 'Continuous-line pen work folded back over itself' },
  { title: 'Signal & Noise', year: 2026, medium: 'Digital Illustration', category: 'digital', dims: 'Variable / Digital', aspect: 'portrait', palette: ['#ff006e', '#ffbe0b', '#3a86ff'], desc: 'Made from fragments that almost line up — close enough to feel intentional, off enough to feel alive.', price: 1400, available: true, materials: PIGMENT_PRINT, technique: 'Vector fragments assembled just off a hand-set grid' },
  { title: 'Untitled No. 04', year: 2026, medium: 'Acrylic on Canvas', category: 'painting', dims: '80 × 100 cm', aspect: 'portrait', palette: ['#e63946', '#457b9d', '#f1faee'], desc: 'Painted in one sitting, start to finish, before the feeling driving it had the chance to fade.', price: 6200, available: true, materials: ['Acrylic paint', 'Cotton canvas', 'Pine stretcher bars', 'Matte varnish'], technique: 'Laid down fast in one sitting, wet-on-wet, before the colour could settle' },
  { title: 'Soft Machine', year: 2023, medium: 'Watercolor on Paper', category: 'drawing', dims: '36 × 48 cm', aspect: 'landscape', palette: ['#457b9d', '#a8dadc'], desc: 'Water finding its own paths across the paper, guided more than controlled.', price: 1200, available: true, materials: ['Watercolour', 'Cotton rag paper', 'Gum arabic'], technique: 'Wet-in-wet washes floated on and left to find their own edges' },
  { title: 'Fractured Bloom', year: 2025, medium: 'Digital Painting', category: 'digital', dims: 'Variable / Digital', aspect: 'square', palette: ['#f72585', '#7209b7', '#4361ee'], desc: 'A flower shape taken apart and rebuilt wrong on purpose, until wrong became its own kind of right.', price: 1300, available: true, materials: PIGMENT_PRINT, technique: 'A single motif taken apart and rebuilt off-register on screen' },
  { title: 'Morning Static', year: 2022, medium: 'Acrylic on Canvas', category: 'painting', dims: '50 × 70 cm', aspect: 'portrait', palette: ['#ffb703', '#fb8500', '#219ebc'], desc: 'Made early, fast, before the day had a chance to talk him out of the colours.', price: 3400, available: true, materials: ['Acrylic paint', 'Cotton canvas', 'Pine stretcher bars', 'Matte varnish'], technique: 'Blocked in early and fast, then flattened back with broad dry strokes' },
  { title: 'Field Notes', year: 2024, medium: 'Graphite on Paper', category: 'drawing', dims: '29 × 42 cm', aspect: 'portrait', palette: ['#111111', '#ffb703'], desc: 'A page of small marks that only make sense together, never one at a time.', price: 800, available: false, materials: ['Graphite', 'Heavyweight cartridge paper', 'Workable fixative'], technique: 'Dense clusters of short marks layered until they read as one field' },
  { title: 'Static Bloom', year: 2023, medium: 'Digital Illustration', category: 'digital', dims: 'Variable / Digital', aspect: 'landscape', palette: ['#06d6a0', '#118ab2', '#ef476f'], desc: 'Grid-built and hand-placed — the structure is mathematical, the colour choices are not.', price: 1100, available: true, materials: PIGMENT_PRINT, technique: 'Grid-built geometry hand-finished with painted detail' },
  { title: 'Untitled No. 09', year: 2021, medium: 'Oil on Canvas', category: 'painting', dims: '90 × 120 cm', aspect: 'landscape', palette: ['#e76f51', '#2a9d8f', '#264653'], desc: 'The largest canvas in the series, and the one that took the longest to feel finished.', price: 6800, available: true, materials: ['Oil paint', 'Linen canvas', 'Pine stretcher bars', 'Gesso ground'], technique: 'Oil built over many weeks in thin drying layers' },
  { title: 'Paper Weather', year: 2025, medium: 'Ink on Paper', category: 'drawing', dims: '25 × 35 cm', aspect: 'square', palette: ['#111111', '#e76f51'], desc: 'A quick sketch that ended up saying more than the careful ones around it.', price: 700, available: true, materials: ['India ink', 'Heavyweight cartridge paper'], technique: 'Quick brush-and-nib gestures left unretouched' },
  { title: 'Glass Garden', year: 2026, medium: 'Digital Painting', category: 'digital', dims: 'Variable / Digital', aspect: 'portrait', palette: ['#3a86ff', '#06d6a0', '#ffd60a'], desc: 'Translucent layers stacked until the piece felt like looking through several windows at once.', price: 1500, available: true, materials: PIGMENT_PRINT, technique: 'Translucent layers stacked and offset like overlapping panes' },
  { title: 'Low Tide', year: 2022, medium: 'Acrylic on Canvas', category: 'painting', dims: '65 × 85 cm', aspect: 'landscape', palette: ['#219ebc', '#8ecae6', '#023047'], desc: 'Blues layered wet-on-wet, left to bleed into each other rather than being kept apart.', price: 4200, available: true, materials: ['Acrylic paint', 'Cotton canvas', 'Pine stretcher bars', 'Matte varnish'], technique: 'Blues layered wet-on-wet and left to bleed into one another' },
  { title: 'Handwriting', year: 2024, medium: 'Charcoal on Paper', category: 'drawing', dims: '42 × 59 cm', aspect: 'portrait', palette: ['#111111', '#8338ec'], desc: 'Marks that behave like handwriting — fast, personal, and not meant to be perfectly legible.', price: 1500, available: true, materials: ['Compressed charcoal', 'Cotton rag paper', 'Workable fixative'], technique: 'Fast, handwriting-like strokes fixed between passes' },
  { title: 'Rendered Weather', year: 2023, medium: 'Digital Illustration', category: 'digital', dims: 'Variable / Digital', aspect: 'square', palette: ['#ff6d00', '#ffd60a', '#003049'], desc: 'An attempt to paint a feeling of heat using nothing but flat colour and geometry.', price: 1200, available: false, materials: PIGMENT_PRINT, technique: 'Flat colour fields and hard geometry composited to suggest heat' },
  { title: 'Untitled No. 12', year: 2025, medium: 'Mixed Media', category: 'painting', dims: '75 × 95 cm', aspect: 'portrait', palette: ['#d62828', '#f77f00', '#003049'], desc: 'Paint, paper, and a few things that were never meant to end up on a canvas.', price: 4800, available: true, materials: ['Acrylic paint', 'Collaged paper', 'Found objects', 'Board panel'], technique: 'Paint, torn paper and found fragments layered onto board' },
  { title: 'Static Hymn', year: 2021, medium: 'Watercolor on Paper', category: 'drawing', dims: '38 × 56 cm', aspect: 'landscape', palette: ['#457b9d', '#f1faee', '#e63946'], desc: 'Made in near silence, which is maybe why it feels the way it does.', price: 1600, available: true, materials: ['Watercolour', 'Cotton rag paper', 'Gum arabic'], technique: 'Pale washes laid down in near silence, one over the next' },
  { title: 'Loop Study', year: 2026, medium: 'Digital Painting', category: 'digital', dims: 'Variable / Digital', aspect: 'landscape', palette: ['#7209b7', '#f72585', '#4cc9f0'], desc: 'One shape, repeated and rotated until the repetition became the subject.', price: 1600, available: false, materials: PIGMENT_PRINT, technique: 'One rotated shape repeated until the repetition became the subject' },
  { title: 'Quiet Riot', year: 2024, medium: 'Oil on Canvas', category: 'painting', dims: '55 × 75 cm', aspect: 'portrait', palette: ['#fca311', '#14213d', '#e5e5e5'], desc: 'Loud colours held very still — the tension between the two is the whole point.', price: 3600, available: true, materials: ['Oil paint', 'Linen canvas', 'Pine stretcher bars', 'Gesso ground'], technique: 'Loud colour held still in slow, deliberate oil passes' },
  { title: 'Marginalia', year: 2023, medium: 'Ink on Paper', category: 'drawing', dims: '21 × 29 cm', aspect: 'portrait', palette: ['#111111', '#2a9d8f'], desc: 'Started as a note in the margin of a sketchbook and never left.', price: 650, available: true, materials: ['India ink', 'Heavyweight cartridge paper'], technique: 'Marginal note-taking marks kept at sketchbook scale' },
  { title: 'Afterimage', year: 2025, medium: 'Digital Illustration', category: 'digital', dims: 'Variable / Digital', aspect: 'portrait', palette: ['#ef476f', '#ffd166', '#06d6a0'], desc: 'Built to look like what you still see with your eyes closed after staring at something bright.', price: 1000, available: true, materials: PIGMENT_PRINT, technique: 'After-image colours pushed through layered digital glazes' },
]

const artworks = RAW.map((item, i) => {
  const id = String(i + 1)
  const file = `piece-${id.padStart(2, '0')}.svg`
  const svg = buildSvg(item.category, i * 7919 + 13, item.palette, item.aspect)
  writeFileSync(join(ASSET_DIR, file), svg, 'utf8')

  const c1 = colorName(item.palette[0])
  const c2 = colorName(item.palette[1])
  const alt = `Abstract ${item.category} artwork titled "${item.title}," featuring ${c1} and ${c2} forms${item.category === 'digital' ? ' in a digitally composed layout' : item.category === 'drawing' ? ' built from expressive linework' : ' layered across the canvas'}.`

  return { id, file, alt, ...item }
})

const CATEGORY_LABEL = { painting: 'Painting', drawing: 'Drawing', digital: 'Digital' }

const fileLines = artworks
  .map((a) => {
    return `  {
    id: '${a.id}',
    title: ${JSON.stringify(a.title)},
    year: ${a.year},
    medium: ${JSON.stringify(a.medium)},
    category: ${JSON.stringify(a.category)},
    categoryLabel: ${JSON.stringify(CATEGORY_LABEL[a.category])},
    dimensions: ${JSON.stringify(a.dims)},
    aspect: ${JSON.stringify(a.aspect)},
    palette: ${JSON.stringify(a.palette)},
    description: ${JSON.stringify(a.desc)},
    price: ${a.price},
    available: ${a.available},
    materials: ${JSON.stringify(a.materials)},
    technique: ${JSON.stringify(a.technique)},
    file: ${JSON.stringify(a.file)},
    alt: ${JSON.stringify(a.alt)},
  },`
  })
  .join('\n')

const dataFile = `// AUTO-GENERATED placeholder catalogue. Safe to hand-edit — this file is not
// regenerated automatically. Swap `+ '`image`' + ` for a real file under
// src/assets/artwork/ and edit the fields directly when real artwork/content
// is available. Re-run scripts/generate-artwork.mjs only if you want an
// entirely fresh placeholder set (it will overwrite this file).

const images = import.meta.glob('../assets/artwork/*.svg', { eager: true, import: 'default' })

export const artworks = [
${fileLines}
].map((a) => ({ ...a, image: images[\`../assets/artwork/\${a.file}\`] }))

export const CATEGORIES = ['all', 'painting', 'drawing', 'digital']

export function getArtworkById(id) {
  return artworks.find((a) => a.id === id)
}

export function getAdjacentArtwork(id) {
  const index = artworks.findIndex((a) => a.id === id)
  if (index === -1) return { prev: null, next: null }
  const prev = artworks[(index - 1 + artworks.length) % artworks.length]
  const next = artworks[(index + 1) % artworks.length]
  return { prev, next }
}
`

writeFileSync(DATA_FILE, dataFile, 'utf8')

console.log(`Generated ${artworks.length} placeholder artworks -> ${ASSET_DIR}`)
console.log(`Wrote data file -> ${DATA_FILE}`)
