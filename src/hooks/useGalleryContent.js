import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const MONO = new Set(['#111111', '#0a0a0a', '#000000', '#ffffff', '#f1faee', '#e5e5e5'])

const toImageUrl = (path) => (path?.startsWith('http') ? path : `${API_URL}${path || ''}`)

const normalizeArtwork = (artwork) => {
  if (!artwork) return null
  return {
    ...artwork,
    id: String(artwork.id),
    categoryLabel: artwork.category_label,
    image: toImageUrl(artwork.images?.[0]?.path),
    images: (artwork.images || []).map((image) => toImageUrl(image.path)),
  }
}

const firstHue = (palette = []) => palette.find((colour) => !MONO.has(colour.toLowerCase())) || palette[0] || '#0a0a0a'

export function useGalleryContent() {
  const [content, setContent] = useState({ processSteps: [], steadyItems: [], howISeePieces: [], artworks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([apiGet('/about'), apiGet('/how-i-see'), apiGet('/artworks')])
      .then(([about, howISee, artworkData]) => {
        const artworks = artworkData.map(normalizeArtwork)
        const byId = new Map(artworks.map((artwork) => [artwork.id, artwork]))
        const processSteps = about.processSteps.map((step) => {
          const art = normalizeArtwork(step.artwork)
          return { ...step, art, accent: firstHue(art?.palette) }
        })
        const steadyItems = about.steadyItems.map((item) => ({
          ...item,
          swatches: (item.swatch_artwork_ids || []).map((id) => {
            const art = byId.get(String(id))
            return { id: String(id), title: art?.title || '', palette: art?.palette || [] }
          }),
          art: normalizeArtwork(item.artwork),
        }))
        const howISeePieces = howISee.map((piece) => {
          const art = normalizeArtwork(piece.artwork)
          return {
            ...piece,
            id: String(piece.id),
            title: art?.title || 'Artwork',
            medium: art?.medium || '',
            fullImage: art?.image,
            closeUpImage: null,
            alt: art?.alt || art?.title || 'Artwork',
            focal: {
              x: Number(piece.focal_x),
              y: Number(piece.focal_y),
              scale: Number(piece.focal_scale),
            },
          }
        })
        setContent({ processSteps, steadyItems, howISeePieces, artworks })
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { ...content, loading, error }
}