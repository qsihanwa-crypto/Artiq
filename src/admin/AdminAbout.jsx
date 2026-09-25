import { useEffect, useState } from 'react'
import { adminFetch } from './api'

const emptyProcess = (sortOrder) => ({ label: '', text: '', artwork_id: '', sort_order: sortOrder })
const emptySteady = (sortOrder) => ({ title: '', body: '', insight: '', artwork_id: '', swatch_artwork_ids: [], sort_order: sortOrder })

function ArtworkSelect({ artworks, value, onChange }) {
  return (
    <select value={value || ''} onChange={(event) => onChange(event.target.value || '')} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2">
      <option value="">No artwork</option>
      {artworks.map((artwork) => <option key={artwork.id} value={artwork.id}>{artwork.title}</option>)}
    </select>
  )
}

export default function AdminAbout() {
  const [processSteps, setProcessSteps] = useState([])
  const [steadyItems, setSteadyItems] = useState([])
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([adminFetch('/process-steps'), adminFetch('/steady-items'), adminFetch('/artworks')])
      .then(([steps, steady, artworkData]) => {
        setProcessSteps(steps)
        setSteadyItems(steady)
        setArtworks(artworkData)
      })
      .catch(() => setError('The About editor could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const updateProcess = (index, field, value) => {
    setProcessSteps((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const updateSteady = (index, field, value) => {
    setSteadyItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const saveProcess = async (step, index) => {
    const method = step.id ? 'PUT' : 'POST'
    const path = step.id ? `/process-steps/${step.id}` : '/process-steps'
    try {
      const saved = await adminFetch(path, { method, body: JSON.stringify({ ...step, artwork_id: step.artwork_id || null }) })
      setProcessSteps((current) => current.map((item, itemIndex) => itemIndex === index ? saved : item))
      setMessage('Process step saved.')
    } catch {
      setMessage('Process step could not be saved.')
    }
  }

  const saveSteady = async (item, index) => {
    const method = item.id ? 'PUT' : 'POST'
    const path = item.id ? `/steady-items/${item.id}` : '/steady-items'
    try {
      const saved = await adminFetch(path, { method, body: JSON.stringify({ ...item, artwork_id: item.artwork_id || null }) })
      setSteadyItems((current) => current.map((entry, entryIndex) => entryIndex === index ? saved : entry))
      setMessage('Steady item saved.')
    } catch {
      setMessage('Steady item could not be saved.')
    }
  }

  const removeProcess = async (step, index) => {
    if (step.id) await adminFetch(`/process-steps/${step.id}`, { method: 'DELETE' })
    setProcessSteps((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const removeSteady = async (item, index) => {
    if (item.id) await adminFetch(`/steady-items/${item.id}`, { method: 'DELETE' })
    setSteadyItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  if (loading) return <p className="text-neutral-600">Loading About editor...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <section className="max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / About</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">About editor</h1>
      <p className="mt-3 text-neutral-600">Edit the creative process and the cards describing what steadies the work.</p>
      {message && <p className="mt-5 text-sm text-neutral-600" role="status">{message}</p>}

      <section className="mt-10 border-t border-neutral-200 pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Creative process</h2>
            <p className="mt-2 text-sm text-neutral-600">These appear as the process thread on the About page.</p>
          </div>
          <button type="button" onClick={() => setProcessSteps((current) => [...current, emptyProcess(current.length)])} className="rounded-full bg-ink px-4 py-2 text-sm text-white">Add step</button>
        </div>
        <div className="mt-6 space-y-5">
          {processSteps.map((step, index) => (
            <article key={step.id || `new-${index}`} className="border border-neutral-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-neutral-700">Label<input value={step.label} onChange={(event) => updateProcess(index, 'label', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
                <label className="text-sm text-neutral-700">Artwork<ArtworkSelect artworks={artworks} value={step.artwork_id} onChange={(value) => updateProcess(index, 'artwork_id', value)} /></label>
              </div>
              <label className="mt-4 block text-sm text-neutral-700">Text<textarea rows="3" value={step.text} onChange={(event) => updateProcess(index, 'text', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
              <div className="mt-4 flex gap-4"><button type="button" onClick={() => saveProcess(step, index)} className="rounded-full bg-ink px-4 py-2 text-sm text-white">Save step</button><button type="button" onClick={() => removeProcess(step, index)} className="text-sm text-neutral-500 hover:text-red-600">Delete</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-neutral-200 pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">What steadies the work</h2>
            <p className="mt-2 text-sm text-neutral-600">These appear as the three interactive cards on the About page.</p>
          </div>
          <button type="button" onClick={() => setSteadyItems((current) => [...current, emptySteady(current.length)])} className="rounded-full bg-ink px-4 py-2 text-sm text-white">Add card</button>
        </div>
        <div className="mt-6 space-y-5">
          {steadyItems.map((item, index) => (
            <article key={item.id || `new-${index}`} className="border border-neutral-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-neutral-700">Title<input value={item.title} onChange={(event) => updateSteady(index, 'title', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
                <label className="text-sm text-neutral-700">Artwork<ArtworkSelect artworks={artworks} value={item.artwork_id} onChange={(value) => updateSteady(index, 'artwork_id', value)} /></label>
              </div>
              <label className="mt-4 block text-sm text-neutral-700">Card text<textarea rows="3" value={item.body} onChange={(event) => updateSteady(index, 'body', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
              <label className="mt-4 block text-sm text-neutral-700">Insight<textarea rows="3" value={item.insight} onChange={(event) => updateSteady(index, 'insight', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
              <label className="mt-4 block text-sm text-neutral-700">Colour swatch artwork IDs<span className="mt-1 block text-xs text-neutral-500">Comma-separated IDs, used by the Colour card.</span><input value={(item.swatch_artwork_ids || []).join(', ')} onChange={(event) => updateSteady(index, 'swatch_artwork_ids', event.target.value.split(',').map((value) => value.trim()).filter(Boolean).map(Number))} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
              <div className="mt-4 flex gap-4"><button type="button" onClick={() => saveSteady(item, index)} className="rounded-full bg-ink px-4 py-2 text-sm text-white">Save card</button><button type="button" onClick={() => removeSteady(item, index)} className="text-sm text-neutral-500 hover:text-red-600">Delete</button></div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
