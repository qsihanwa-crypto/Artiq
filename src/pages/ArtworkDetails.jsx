import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowLeft, ArrowRight, ArrowUpLeft } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import Button from '../components/buttons/Button'
import AddToCartButton from '../components/cart/AddToCartButton'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useArtworks } from '../hooks/useArtwork'

export default function ArtworkDetails() {
  const { id } = useParams()
  const { artworks, loading, error } = useArtworks()
  const artwork = artworks.find((item) => item.id === String(id))
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    setActive(0)
  }, [id])

  useLayoutEffect(() => {
    if (!artwork) return
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.fromTo(
        '[data-detail-reveal]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.06 },
      )
    }, ref)
    return () => ctx.revert()
  }, [artwork, reduced, id])

  if (loading) {
    return <div className="px-6 pt-40 text-center text-neutral-600 sm:px-10">Loading artwork...</div>
  }

  if (error || !artwork) {
    return (
      <div className="px-6 pt-40 text-center sm:px-10">
        <h1 className="font-display text-3xl font-semibold text-ink">Artwork not found</h1>
        <p className="mt-3 text-neutral-600">This piece may have moved or the link is out of date.</p>
        <Button to="/catalogue" variant="primary" size="md" className="mt-8">
          Back to collection
        </Button>
      </div>
    )
  }

  const artworkIndex = artworks.findIndex((item) => item.id === String(id))
  const prev = artworkIndex > 0 ? artworks[artworkIndex - 1] : null
  const next = artworkIndex < artworks.length - 1 ? artworks[artworkIndex + 1] : null
  const gallery = artwork.images && artwork.images.length ? artwork.images : [artwork.image]
  const current = gallery[active] || gallery[0]

  return (
    <div ref={ref} className="px-6 pb-28 pt-32 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/catalogue"
          data-detail-reveal
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-ink"
        >
          <ArrowUpLeft size={16} aria-hidden="true" /> Back to Collection
        </Link>

        <div data-detail-reveal className="mt-8 overflow-hidden rounded-3xl bg-neutral-100">
          <img src={current} alt={artwork.alt} className="w-full object-cover" />
        </div>

        {gallery.length > 1 && (
          <div data-detail-reveal className="mt-4 flex flex-wrap gap-3" role="group" aria-label="More photos of this piece">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show photo ${i + 1} of ${gallery.length}`}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                  i === active ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr]">
          <div data-detail-reveal>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{artwork.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
              <span>{artwork.medium}</span>
              <span>{artwork.dimensions}</span>
              <span>{artwork.categoryLabel}</span>
            </div>
            <p className="mt-5 font-display text-2xl font-semibold text-ink">
              {artwork.available ? formatPrice(artwork.price) : 'Sold'}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-neutral-700">{artwork.description}</p>

            <div className="mt-8">
              <AddToCartButton artwork={artwork} size="lg" />
              <p className="mt-3 text-sm text-neutral-500">
                {artwork.available
                  ? `Add it to your cart and check out over WhatsApp — I handle payment and delivery with you directly.`
                  : 'This original has sold. I may have something close, or can make one — just ask.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div data-detail-reveal className="glass h-fit rounded-2xl p-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Materials &amp; technique</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-neutral-500">Materials</dt>
                  <dd className="mt-1 text-neutral-700">{(artwork.materials || []).join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Technique</dt>
                  <dd className="mt-1 text-neutral-700">{artwork.technique}</dd>
                </div>
              </dl>
            </div>

            {artwork.features && artwork.features.length > 0 && (
              <div data-detail-reveal className="glass h-fit rounded-2xl p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">About this piece</h2>
                <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                  {artwork.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <nav aria-label="More artwork" className="mt-16 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-8 sm:grid-cols-2">
          {prev && (
            <Link to={`/artwork/${prev.id}`} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-black/5">
              <ArrowLeft size={20} className="shrink-0 text-neutral-400 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Previous artwork</p>
                <p className="truncate font-display text-lg font-medium text-ink">{prev.title}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link to={`/artwork/${next.id}`} className="group flex items-center justify-end gap-4 rounded-2xl p-3 text-right transition-colors hover:bg-black/5 sm:col-start-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Next artwork</p>
                <p className="truncate font-display text-lg font-medium text-ink">{next.title}</p>
              </div>
              <ArrowRight size={20} className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
