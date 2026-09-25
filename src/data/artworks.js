// Dennis Liew — catalogue taken from dennisliew.art. That site gives titles
// only (no media, sizes or dates), so `medium` stays generic and each
// description just says what the painting shows. Photos live in
// src/assets/artwork/<slug>-1.<jpg|webp>.

const files = import.meta.glob('../assets/artwork/*.{jpg,webp}', { eager: true, import: 'default' })

const resolve = (slug) => Object.entries(files).find(([path]) => path.includes(`/${slug}-1.`))?.[1]

export const CATEGORY_LABELS = {
  all: 'All',
  gardens: 'Gardens',
  landscapes: 'Landscapes',
  places: 'Places',
  'still-life': 'Still life',
}

export const artworks = [
  {
    id: '1',
    slug: 'fancy-garden',
    title: 'Fancy Garden',
    category: 'gardens',
    description: 'Drifts of pink and violet blossom line a garden path beneath the hanging curtain of a willow.',
  },
  {
    id: '2',
    slug: 'penang-old-town',
    title: 'Penang Old Town',
    category: 'places',
    description: 'A corner of old Penang: green-shuttered shophouses, a rojak stall under striped umbrellas, and a trishaw waiting at the kerb.',
  },
  {
    id: '3',
    slug: 'a-view-of-cheringin-hill',
    title: 'A view of Cheringin Hill',
    category: 'landscapes',
    description: 'Red-roofed houses tucked into green hillside, with mist rolling over the valley beyond.',
  },
  {
    id: '4',
    slug: 'yellow-irises-by-the-stream',
    title: 'Yellow Irises by the Stream',
    category: 'gardens',
    description: 'Yellow irises crowd the bank of a blue stream, with an arched wooden footbridge crossing behind them.',
  },
  {
    id: '5',
    slug: 'apples-for-tea',
    title: 'Apples For Tea?',
    category: 'still-life',
    description: 'A still life of green apples, an old copper kettle and a glass of tea, set among folds of blue and orange cloth.',
  },
  {
    id: '6',
    slug: 'a-beautiful-garden-in-pointillism-style',
    title: 'A beautiful garden in Pointillism style',
    medium: 'Painting, pointillism',
    category: 'gardens',
    description: 'Winding bands of orange, pink, blue and white flowers, built up dot by dot, loop between green pools.',
  },
  {
    id: '7',
    slug: 'light-of-hope',
    title: 'Light of Hope',
    category: 'landscapes',
    description: 'Sunlight breaks through violet storm clouds onto golden hills, an arched stone bridge and a quiet lake.',
  },
  {
    id: '8',
    slug: 'lake-wanaka-at-sunrise',
    title: 'Lake Wanaka at Sunrise',
    category: 'landscapes',
    description: 'A lone tree stands in the still water of Lake Wanaka as the sun rises over the mountains.',
  },
].map((a) => ({
  medium: 'Painting',
  aspect: 'landscape',
  ...a,
  categoryLabel: CATEGORY_LABELS[a.category],
  alt: `"${a.title}" by Dennis Liew. ${a.description}`,
  image: resolve(a.slug),
}))
