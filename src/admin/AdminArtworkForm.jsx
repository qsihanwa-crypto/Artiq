import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminFetch } from './api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const ARRAY_FIELDS = ['palette', 'features', 'materials', 'tags']
const EMPTY_FORM = {
  title: '', slug: '', medium: '', category: '', category_label: '', dimensions: '', aspect: 'portrait',
  palette: [], description: '', features: [], price: '', available: true, materials: [], technique: '',
  tags: [], alt: '', featured: false, sort_order: 0,
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function normalizeArtwork(artwork) {
  return {
    ...EMPTY_FORM,
    ...artwork,
    ...Object.fromEntries(ARRAY_FIELDS.map((field) => [field, Array.isArray(artwork[field]) ? artwork[field] : []])),
  }
}

export default function AdminArtworkForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [files, setFiles] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    adminFetch(`/artworks/${id}`)
      .then((artwork) => {
        setForm(normalizeArtwork(artwork))
        setImages(artwork.images || [])
      })
      .catch((loadError) => setError(loadError.message || 'The artwork could not be loaded.'))
      .finally(() => setLoading(false))
  }, [id])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateLines = (field, value) => update(field, value.split('\n').map((line) => line.trim()).filter(Boolean))

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const formData = new FormData()

    Object.entries(form).forEach(([field, value]) => {
      if (ARRAY_FIELDS.includes(field)) value.forEach((item) => formData.append(`${field}[]`, item))
      else if (field === 'available' || field === 'featured') formData.append(field, value ? '1' : '0')
      else if (value !== '' && value !== null && value !== undefined) formData.append(field, value)
    })
    try {
      const imageData = await Promise.all(files.map(readFileAsDataUrl))
      imageData.forEach((dataUrl) => formData.append('image_data[]', dataUrl))
    } catch (fileError) {
      setError(fileError.message)
      setSaving(false)
      return
    }

    try {
      if (id) {
        formData.append('_method', 'PUT')
        await adminFetch(`/artworks/${id}`, { method: 'POST', body: formData })
      } else {
        await adminFetch('/artworks', { method: 'POST', body: formData })
      }
      navigate('/admin/catalogue')
    } catch (submitError) {
      setError(submitError.message || 'The artwork could not be saved. Check the required fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteImage(image) {
    try {
      await adminFetch(`/artworks/${id}/images/${image.id}`, { method: 'DELETE' })
      setImages((current) => current.filter((item) => item.id !== image.id))
    } catch {
      setError('The image could not be deleted.')
    }
  }

  if (loading) return <p className="text-neutral-600">Loading artwork...</p>

  return (
    <section className="max-w-3xl">
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink">{id ? 'Edit artwork' : 'New artwork'}</h1>
        </div>
        <Link to="/admin/catalogue" className="text-sm text-neutral-500 hover:text-ink">Back to catalogue</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <fieldset className="grid gap-5 border-t border-neutral-200 pt-6 sm:grid-cols-2">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Details</legend>
          {[
            ['title', 'Title', true], ['slug', 'Slug', false], ['medium', 'Medium', true], ['category', 'Category', true],
            ['category_label', 'Category label', true], ['dimensions', 'Dimensions', false], ['price', 'Price', true], ['alt', 'Alt text', true],
          ].map(([field, label, required]) => (
            <label key={field} className="block text-sm text-neutral-700">
              {label}
              <input required={required} type={field === 'price' ? 'number' : 'text'} step={field === 'price' ? '0.01' : undefined} value={form[field]} onChange={(event) => update(field, event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" />
            </label>
          ))}
          <label className="block text-sm text-neutral-700">Aspect<select required value={form.aspect} onChange={(event) => update('aspect', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option></select></label>
          <label className="block text-sm text-neutral-700">Sort order<input type="number" min="0" value={form.sort_order} onChange={(event) => update('sort_order', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
        </fieldset>

        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Description</legend>
          <label className="block text-sm text-neutral-700">Description<textarea required rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
          <label className="block text-sm text-neutral-700">Technique<textarea rows="3" value={form.technique} onChange={(event) => update('technique', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
          {ARRAY_FIELDS.map((field) => <label key={field} className="block text-sm capitalize text-neutral-700">{field}<textarea rows="3" value={form[field].join('\n')} onChange={(event) => updateLines(field, event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>)}
        </fieldset>

        <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Status and images</legend>
          <label className="flex items-center gap-3 text-sm text-neutral-700"><input type="checkbox" checked={form.available} onChange={(event) => update('available', event.target.checked)} /> Available for sale</label>
          <label className="flex items-center gap-3 text-sm text-neutral-700"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} /> Featured on Home</label>
          <label className="block text-sm text-neutral-700">Add images<input type="file" multiple accept="image/*" onChange={(event) => setFiles([...event.target.files])} className="mt-2 block w-full text-sm" /></label>
          {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="relative"><img src={`${API_URL}${image.path}`} alt="" className="aspect-square w-full rounded object-cover" /><button type="button" onClick={() => deleteImage(image)} className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs text-red-600">Delete</button></div>)}</div>}
        </fieldset>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save artwork'}</button>
      </form>
    </section>
  )
}
