import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'
import { artworks as fallbackArtworks } from '../data/artworks'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const fallbackBySlug = new Map(fallbackArtworks.map((artwork) => [artwork.slug, artwork]))

function imageUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

function normalizeArtwork(artwork) {
  const fallback = fallbackBySlug.get(artwork.slug)
  const images = (artwork.images || []).map((image) => imageUrl(image.path)).filter(Boolean)

  return {
    ...fallback,
    ...artwork,
    id: String(artwork.id),
    categoryLabel: artwork.category_label || fallback?.categoryLabel || artwork.category,
    image: images[0] || fallback?.image || '',
    images: images.length ? images : fallback?.images || [],
    alt: artwork.alt || fallback?.alt || artwork.title,
  }
}

export function useArtworks({ featured = false } = {}) {
  const [remoteArtworks, setRemoteArtworks] = useState(null)

  useEffect(() => {
    let active = true
    const query = featured ? '?featured=1' : ''

    apiGet(`/artworks${query}`)
      .then((data) => {
        if (active) setRemoteArtworks(data.map(normalizeArtwork))
      })
      .catch(() => {
        if (active) setRemoteArtworks(null)
      })

    return () => {
      active = false
    }
  }, [featured])

  const localFallback = featured ? fallbackArtworks.slice(0, 6) : fallbackArtworks
  const artworks = remoteArtworks ?? localFallback

  return { artworks, loading: false, error: null }
}
