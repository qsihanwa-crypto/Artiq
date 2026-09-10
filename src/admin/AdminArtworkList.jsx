import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminFetch } from './api'

export default function AdminArtworkList() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    adminFetch('/artworks')
      .then(setArtworks)
      .catch(() => setError('Could not load artworks.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleAvailability(artwork) {
    const updated = await adminFetch(`/artworks/${artwork.id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available: !artwork.available }),
    })
    setArtworks((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  async function deleteArtwork(artwork) {
    if (!window.confirm(`Delete "${artwork.title}"?`)) return
    await adminFetch(`/artworks/${artwork.id}`, { method: 'DELETE' })
    setArtworks((current) => current.filter((item) => item.id !== artwork.id))
  }

  if (loading) return <p>Loading artworks...</p>
  if (error) return <p>{error}</p>

  return (
    <section className="max-w-6xl">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Catalogue</h1>
          <p className="mt-2 text-neutral-600">{artworks.length} artworks in your collection.</p>
        </div>
        <Link to="/admin/catalogue/new" className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">New artwork</Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {artworks.map((artwork) => {
          const thumbnail = artwork.images?.[0]?.path
          return (
            <article key={artwork.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {thumbnail ? (
                <img src={`${apiUrl}${thumbnail}`} alt={artwork.alt || artwork.title} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-sm text-neutral-400">No image</div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold text-ink">{artwork.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-500">{artwork.category}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${artwork.available ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {artwork.available ? 'Available' : 'Sold'}
                  </span>
                </div>
                <p className="mt-4 font-display text-xl font-semibold text-ink">${Number(artwork.price || 0).toFixed(2)}</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                  <Link to={`/admin/catalogue/${artwork.id}`} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">Edit</Link>
                  <button type="button" onClick={() => toggleAvailability(artwork)} className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700">
                    {artwork.available ? 'Mark sold' : 'Mark available'}
                  </button>
                  <button type="button" onClick={() => deleteArtwork(artwork)} className="px-2 py-2 text-sm text-red-600">Delete</button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}