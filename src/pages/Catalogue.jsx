import { useMemo, useState } from 'react'
import SectionHeading from '../components/common/SectionHeading'
import Carousel3D from '../components/3d/Carousel3D'
import CatalogueFilters from '../components/gallery/CatalogueFilters'
import MasonryGallery from '../components/gallery/MasonryGallery'
import { useArtworks } from '../hooks/useArtwork'

export default function Catalogue() {
  const [category, setCategory] = useState('all')
  const { artworks, loading, error } = useArtworks()
  const categories = useMemo(
    () => ['all', ...new Set(artworks.map((artwork) => artwork.category))],
    [artworks],
  )

  const filtered = useMemo(
    () => (category === 'all' ? artworks : artworks.filter((a) => a.category === category)),
    [category, artworks],
  )

  return (
    <div className="pt-32 sm:pt-40">
      <section className="px-6 pb-16 text-center sm:px-10">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Catalogue</span>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
          THE COLLECTION
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600">
          {loading ? 'Loading the collection...' : `${artworks.length} originals — acrylic and oil paintings, wood-burning and carving. Each one is the only one.`}
        </p>
      </section>

      {error ? (
        <p className="px-6 pb-24 text-center text-neutral-600 sm:px-10">The collection could not be loaded right now.</p>
      ) : loading ? (
        <p className="px-6 pb-24 text-center text-neutral-600 sm:px-10" aria-live="polite">Loading artwork...</p>
      ) : artworks.length > 0 ? (
        <section className="px-6 pb-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <Carousel3D artworks={artworks} />
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-28 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading kicker="Browse" title="Full Catalogue" className="mb-10" />
          <div className="mb-10">
            <CatalogueFilters
              categories={categories}
              activeCategory={category}
              onCategoryChange={setCategory}
            />
          </div>
          <MasonryGallery artworks={filtered} />
        </div>
      </section>
    </div>
  )
}
