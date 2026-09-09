// "How I See" — the detail-to-whole flip cards in the home Interact section.
//
// Each card opens on a macro crop (the fragment the work started from), then
// flips to the whole piece plus a first-person note on what Kirtanraw was
// tracking while making it. Ordered loosely so the set reads as a progression.
//
// These deliberately avoid the spiritual/deity pieces: the cards crop hard into
// a fragment, and a sacred image shown cut-off can read as disrespectful. The
// full spiritual work lives in the catalogue, shown whole and in context.
//
// `fullImage` is pulled from the real catalogue by id and the front is a CSS
// zoom of it, aimed by `focal` ({ x%, y%, scale }). Insights are in the
// artist's own voice. Swap `closeUpImage` for a real macro photo later; nothing
// else needs to change.

import { artworks } from './artworks'

const byId = (id) => artworks.find((a) => a.id === id)

export const howISeePieces = [
  {
    id: '69',
    title: 'Vibrant Owl Portrait',
    medium: 'Acrylic on canvas',
    focal: { x: 50, y: 38, scale: 3 },
    insight:
      "Eyes and face first. Get those wrong and it's just feathers — so I don't touch anything else until it's looking back at me.",
  },
  {
    id: '51',
    title: 'Majestic Tiger Painting',
    medium: 'Acrylic on canvas',
    focal: { x: 52, y: 40, scale: 3.2 },
    insight:
      'The eyes, then the stripes outward from there. The stripes are what turn paint into an animal.',
  },
  {
    id: '31',
    title: 'Wooden Cityscape Wall Art',
    medium: 'Wood-burning on timber',
    focal: { x: 48, y: 52, scale: 2.7 },
    insight:
      "You can't lift a burned line, so with pyrography I go lightest first and darken in passes. Patience is most of the skill.",
  },
  {
    id: '32',
    title: 'Artisan Doberman Wooden Relief',
    medium: 'Hand-carved wood',
    focal: { x: 50, y: 44, scale: 2.8 },
    insight:
      "Carving is taking away. The dog is already in the panel — my job is removing everything that isn't the dog.",
  },
  {
    id: '54',
    title: "'Whirlwind of Colors' Abstract Painting",
    medium: 'Acrylic on canvas',
    focal: { x: 46, y: 50, scale: 3.1 },
    insight:
      'No subject on this one, just colour. I let the knife lead and made myself stop before I tidied the life out of it.',
  },
].map((piece) => {
  const art = byId(piece.id)
  return {
    ...piece,
    fullImage: piece.fullImage ?? art?.image,
    closeUpImage: piece.closeUpImage ?? null,
    alt: art?.alt ?? piece.title,
  }
})
