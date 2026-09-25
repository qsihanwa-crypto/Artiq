import { useEffect, useState } from 'react'
import { adminFetch } from './api'

const EMPTY_CONTENT = {
  heroLines: ['', '', ''],
  heroSubtext: '',
  introHeadline1: '',
  introHeadline2: '',
  introBody: '',
  artistIntroParagraphs: [''],
}

export default function AdminHome() {
  const [content, setContent] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    Promise.all([adminFetch('/settings'), adminFetch('/artworks')])
      .then(([settings, artworkData]) => {
        const homeContent = settings.home_content || {}
        setContent({
          ...EMPTY_CONTENT,
          ...homeContent,
          heroLines: [...(homeContent.heroLines || []), ...EMPTY_CONTENT.heroLines].slice(0, 3),
          artistIntroParagraphs: homeContent.artistIntroParagraphs?.length
            ? homeContent.artistIntroParagraphs
            : EMPTY_CONTENT.artistIntroParagraphs,
        })
        setArtworks(artworkData)
      })
      .catch(() => setError('The Home editor could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const updateContent = (field, value) => {
    setContent((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  const updateHeroLine = (index, value) => {
    const heroLines = [...content.heroLines]
    heroLines[index] = value
    updateContent('heroLines', heroLines)
  }

  const updateParagraph = (index, value) => {
    const artistIntroParagraphs = [...content.artistIntroParagraphs]
    artistIntroParagraphs[index] = value
    updateContent('artistIntroParagraphs', artistIntroParagraphs)
  }

  const saveContent = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await adminFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ key: 'home_content', value: content }),
      })
      setMessage('Home content saved.')
    } catch {
      setMessage('Home content could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const toggleFeatured = async (artwork) => {
    setUpdatingId(artwork.id)
    try {
      const updated = await adminFetch(`/artworks/${artwork.id}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({ featured: !artwork.featured }),
      })
      setArtworks((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      setMessage('Featured artwork could not be updated.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <p className="text-neutral-600">Loading Home editor...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <section className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / Home</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Home editor</h1>
      <p className="mt-3 text-neutral-600">Edit the copy and artwork selected for the public Home page.</p>

      <form onSubmit={saveContent} className="mt-10 space-y-8">
        <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Hero</legend>
          {content.heroLines.map((line, index) => (
            <label key={index} className="block text-sm text-neutral-700">
              Headline line {index + 1}
              <input
                value={line}
                onChange={(event) => updateHeroLine(index, event.target.value)}
                className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
              />
            </label>
          ))}
          <label className="block text-sm text-neutral-700">
            Hero subtext
            <textarea
              rows="3"
              value={content.heroSubtext}
              onChange={(event) => updateContent('heroSubtext', event.target.value)}
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Intro statement</legend>
          {[
            ['introHeadline1', 'First headline'],
            ['introHeadline2', 'Second headline'],
          ].map(([field, label]) => (
            <label key={field} className="block text-sm text-neutral-700">
              {label}
              <input
                value={content[field]}
                onChange={(event) => updateContent(field, event.target.value)}
                className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
              />
            </label>
          ))}
          <label className="block text-sm text-neutral-700">
            Intro body
            <textarea
              rows="5"
              value={content.introBody}
              onChange={(event) => updateContent('introBody', event.target.value)}
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Artist introduction</legend>
          {content.artistIntroParagraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-3">
              <label className="block flex-1 text-sm text-neutral-700">
                Paragraph {index + 1}
                <textarea
                  rows="4"
                  value={paragraph}
                  onChange={(event) => updateParagraph(index, event.target.value)}
                  className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
                />
              </label>
              {content.artistIntroParagraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() => updateContent('artistIntroParagraphs', content.artistIntroParagraphs.filter((_, itemIndex) => itemIndex !== index))}
                  className="mt-7 self-start text-sm text-neutral-500 hover:text-ink"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateContent('artistIntroParagraphs', [...content.artistIntroParagraphs, ''])}
            className="text-sm font-medium text-neutral-700 underline underline-offset-4"
          >
            Add paragraph
          </button>
        </fieldset>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Home content'}
          </button>
          {message && <p className="text-sm text-neutral-600" role="status">{message}</p>}
        </div>
      </form>

      <section className="mt-14 border-t border-neutral-200 pt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Featured artwork</h2>
        <p className="mt-2 text-sm text-neutral-600">Choose which available pieces appear in the Home page feature grid.</p>
        <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
          {artworks.map((artwork) => (
            <label key={artwork.id} className="flex items-center gap-3 py-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={Boolean(artwork.featured)}
                disabled={updatingId === artwork.id}
                onChange={() => toggleFeatured(artwork)}
                className="h-4 w-4"
              />
              <span>{artwork.title}</span>
              {updatingId === artwork.id && <span className="text-xs text-neutral-500">Saving...</span>}
            </label>
          ))}
        </div>
      </section>
    </section>
  )
}