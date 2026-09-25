import { artworks as allArtworks } from '../data/artworks';

const FEATURED_COUNT = 6;

export function useArtworks({ featured = false } = {}) {
  const artworks = featured ? allArtworks.slice(0, FEATURED_COUNT) : allArtworks;
  return { artworks, loading: false, error: null };
}
