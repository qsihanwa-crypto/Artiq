import { useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowLeft, ArrowRight, ArrowUpLeft } from 'lucide-react'
import Button from '../components/buttons/Button'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useArtworks } from '../hooks/useArtwork'

export default function ArtworkDetails() {
  const { id } = useParams()
  const { artworks, loading, error } = useArtworks()
  const artwork = artworks.find((item) => item.id === String(id))
  const ref = useRef(null)
  const reduced = useReducedMotion()
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
    return <div className="px-6 pt-40 text-center text-zinc-600 sm:px-10">Loading artwork...</div>
  }

  if (error || !artwork) {
    return (
      <div className="px-6 pt-40 text-center sm:px-10">
        <h1 className="font-display text-3xl font-semibold text-zinc-950">Artwork not found</h1>
        <p className="mt-3 text-zinc-600">This piece may have moved or the link is out of date.</p>
        <Button to="/catalogue" variant="primary" size="md" className="mt-8">
          Back to collection
        </Button>
      </div>
    )
  }

  const artworkIndex = artworks.findIndex((item) => item.id === String(id))
  const prev = artworkIndex > 0 ? artworks[artworkIndex - 1] : null
  const next = artworkIndex < artworks.length - 1 ? artworks[artworkIndex + 1] : null

  return (
    <div ref={ref} className="px-6 pb-28 pt-32 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/catalogue"
          data-detail-reveal
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
        >
          <ArrowUpLeft size={16} aria-hidden="true" /> Back to Collection
        </Link>

        <div data-detail-reveal className="mt-8 overflow-hidden rounded-3xl bg-neutral-100">
          <img src={artwork.image} alt={artwork.alt} className="w-full object-cover" />
        </div>

        <div data-detail-reveal className="mt-10 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">{artwork.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
            <span>{artwork.medium}</span>
            <span>{artwork.categoryLabel}</span>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-zinc-700">{artwork.description}</p>
        </div>

        <nav aria-label="More artwork" className="mt-16 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-8 sm:grid-cols-2">
          {prev && (
            <Link to={`/artwork/${prev.id}`} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-black/5">
              <ArrowLeft size={20} className="shrink-0 text-zinc-400 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Previous artwork</p>
                <p className="truncate font-display text-lg font-medium text-zinc-950">{prev.title}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link to={`/artwork/${next.id}`} className="group flex items-center justify-end gap-4 rounded-2xl p-3 text-right transition-colors hover:bg-black/5 sm:col-start-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Next artwork</p>
                <p className="truncate font-display text-lg font-medium text-zinc-950">{next.title}</p>
              </div>
              <ArrowRight size={20} className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
