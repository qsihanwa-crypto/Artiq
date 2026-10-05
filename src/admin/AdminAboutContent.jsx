import { useEffect, useState } from 'react'
import { adminFetch } from './api'
import { site } from '../data/site'

const EMPTY_PRESS = { year: '', outlet: '', title: '', href: '' }
const inputClass = 'mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2'

export default function AdminAboutContent() {
  const [content, setContent] = useState(site.about_content)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminFetch('/settings')
      .then((settings) => setContent({ ...site.about_content, ...(settings.about_content || {}) }))
      .catch(() => setError('The About editor could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const update = (field, value) => {
    setContent((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  const updatePress = (index, key, value) =>
    update('press', content.press.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const value = {
      ...content,
      storyParagraphs: content.storyParagraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
      press: content.press.filter((item) => item.title.trim() && item.href.trim()),
    }
    try {
      await adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ key: 'about_content', value }) })
      setContent(value)
      setMessage('About page saved.')
    } catch (saveError) {
      setError(saveError.message || 'The About page could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-neutral-600">Loading About editor...</p>

  return (
    <form onSubmit={save} className="max-w-3xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / About</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">About editor</h1>
        <p className="mt-3 text-neutral-600">Edit the text shown on the public About page.</p>
      </div>

      <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
        <legend className="mb-2 font-display text-2xl font-semibold text-ink">Introduction</legend>
        <label className="block text-sm text-neutral-700">Heading<input required value={content.heading} onChange={(event) => update('heading', event.target.value)} className={inputClass} /></label>
        <label className="block text-sm text-neutral-700">Intro text<textarea required rows="3" value={content.intro} onChange={(event) => update('intro', event.target.value)} className={inputClass} /></label>
      </fieldset>

      <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
        <legend className="mb-2 font-display text-2xl font-semibold text-ink">Story</legend>
        <label className="block text-sm text-neutral-700">Section title<input required value={content.storyTitle} onChange={(event) => update('storyTitle', event.target.value)} className={inputClass} /></label>
        <label className="block text-sm text-neutral-700">
          Paragraphs
          <span className="mt-1 block text-xs text-neutral-500">Leave a blank line between paragraphs.</span>
          <textarea required rows="10" value={content.storyParagraphs.join('\n\n')} onChange={(event) => update('storyParagraphs', event.target.value.split(/\n\s*\n/))} className={inputClass} />
        </label>
      </fieldset>

      <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
        <div className="flex items-end justify-between gap-4">
          <legend className="font-display text-2xl font-semibold text-ink">In the media</legend>
          <button type="button" onClick={() => update('press', [...content.press, EMPTY_PRESS])} className="rounded-full bg-ink px-4 py-2 text-sm text-white">Add article</button>
        </div>
        {content.press.map((item, index) => (
          <article key={index} className="space-y-4 border border-neutral-200 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-neutral-700">Year<input value={item.year} onChange={(event) => updatePress(index, 'year', event.target.value)} className={inputClass} /></label>
              <label className="text-sm text-neutral-700">Outlet<input value={item.outlet} onChange={(event) => updatePress(index, 'outlet', event.target.value)} className={inputClass} /></label>
            </div>
            <label className="block text-sm text-neutral-700">Title<input value={item.title} onChange={(event) => updatePress(index, 'title', event.target.value)} className={inputClass} /></label>
            <label className="block text-sm text-neutral-700">Link<input type="url" value={item.href} onChange={(event) => updatePress(index, 'href', event.target.value)} className={inputClass} /></label>
            <button type="button" onClick={() => update('press', content.press.filter((_, itemIndex) => itemIndex !== index))} className="text-sm text-neutral-500 hover:text-red-600">Remove</button>
          </article>
        ))}
      </fieldset>

      <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
        <legend className="mb-2 font-display text-2xl font-semibold text-ink">Closing message</legend>
        <label className="block text-sm text-neutral-700">Text<textarea required rows="3" value={content.closing} onChange={(event) => update('closing', event.target.value)} className={inputClass} /></label>
      </fieldset>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {message && <p className="text-sm text-neutral-600" role="status">{message}</p>}
      <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save About page'}</button>
    </form>
  )
}
