// About page data — the interactive Process thread and the "What steadies the
// work" flip cards. Copy is in Kirtanraw's own voice (first person), drawn from
// the bio on kirtanrawartgallery.com; no invented shows, awards, or dates.
// Every image and accent colour is pulled from the real catalogue by id, so the
// components never carry their own art.

import { artworks } from './artworks'

const byId = (id) => artworks.find((a) => a.id === id)

// First palette entry that reads as a hue rather than near-black / near-white,
// so a process node's colour dot is always a real colour taken from the artwork.
const MONO = new Set(['#111111', '#0a0a0a', '#000000', '#ffffff', '#f1faee', '#e5e5e5'])
const firstHue = (palette = []) => palette.find((c) => !MONO.has(c.toLowerCase())) || palette[0] || '#0a0a0a'

const RAW_STEPS = [
  { label: 'Idea', text: "Usually it's a subject I keep coming back to in my head — a figure, an animal, a car — until I have to start.", artId: '70' },
  { label: 'Drawing', text: "I draw the whole thing out full size first. If the drawing's wrong, no amount of colour later will save it.", artId: '49' },
  { label: 'Blocking in', text: 'On wood I burn the outlines and shadows in first. On canvas the darkest darks go down early and I work toward the light.', artId: '43' },
  { label: 'Colour', text: "Then colour, layer over layer, slowly. Hours go here — this is the part I'd happily do all day.", artId: '57' },
  { label: 'Finished work', text: "Sealing, and a long last look for anything not right. It doesn't leave the bench until I'd hang it myself.", artId: '54' },
]

export const processSteps = RAW_STEPS.map((step) => {
  const art = byId(step.artId)
  return { ...step, art, accent: firstHue(art?.palette) }
})

const RAW_STEADY = [
  {
    title: 'Routine',
    body: 'Same corner, same tools in the same places, every working day.',
    insight:
      "I lay everything out the same way — pens on one side, paint on the other. Once my hands know where things are without looking, the room disappears and it's just me and the piece.",
    artId: '48',
  },
  {
    title: 'Focus',
    body: 'Long stretches on one piece, following a single thread until it resolves.',
    insight:
      "On a good day I look up and it's dark out. I've moved one shape three millimetres and I'm pleased about it. That's the feeling I keep coming back for.",
    artId: '51',
  },
  {
    title: 'Colour',
    body: "The colours usually turn up before the drawing's even finished.",
    insight:
      'I nearly always know the palette first. Subject, size, finish — those come after. The colour is the feeling; the rest is me building something for it to live in.',
    swatchArtIds: ['51', '54', '60', '52', '70'],
  },
]

export const steadyItems = RAW_STEADY.map((item) => ({
  ...item,
  art: item.artId ? byId(item.artId) : null,
  swatches: (item.swatchArtIds || []).map((id) => {
    const art = byId(id)
    return { id, title: art?.title || '', palette: art?.palette || [] }
  }),
}))
