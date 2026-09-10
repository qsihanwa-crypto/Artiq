import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const toImageUrl = (path) => (path?.startsWith('http') ? path : `${API_URL}${path}`);

const normalizeArtwork = (artwork) => ({
  ...artwork,
  id: String(artwork.id),
  categoryLabel: artwork.category_label,
  image: toImageUrl(artwork.images?.[0]?.path),
  images: (artwork.images || []).map((image) => toImageUrl(image.path)),
});

export function useArtworks({ featured = false } = {}) {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet(`/artworks${featured ? '?featured=1' : ''}`)
      .then((data) => setArtworks(data.map(normalizeArtwork)))
      .catch((requestError) => setError(requestError))
      .finally(() => setLoading(false));
  }, [featured]);

  return { artworks, loading, error };
}