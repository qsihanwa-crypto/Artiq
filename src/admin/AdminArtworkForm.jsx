import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Info, X } from 'lucide-react'
import { adminFetch } from './api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const ARRAY_FIELDS = ['palette', 'features', 'materials', 'tags']
const CATEGORY_OPTIONS = [
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'pyrography', label: 'Pyrography' },
  { value: 'carving', label: 'Wood Carving' },
  { value: 'acrylic', label: 'Painting' },
]
const CUSTOM_CATEGORY_VALUE = '__custom__'
const EMPTY_FORM = {
  title: '', slug: '', medium: '', category: '', category_label: '', dimensions: '', aspect: 'portrait',
  palette: [], description: '', features: [], price: '', available: true, status: 'for_sale', materials: [], technique: '',
  tags: [], alt: '', featured: false, sort_order: 0,
}
const FIELD_HELP = {
  title: 'The artwork name shown to visitors.',
  slug: 'Optional URL-friendly identifier. Leave blank to let the system create one from the title.',
  medium: 'The main material or medium, such as Acrylic on canvas.',
  category: 'Choose the artwork type. The visitor-facing category label is filled automatically.',
  dimensions: 'Physical size, for example 60 x 90 cm.',
  price: 'Price in the site currency. Enter numbers only.',
  alt: 'Short description of the image for screen readers and search engines.',
  aspect: 'Choose the artwork orientation so the gallery can frame it correctly.',
  sort_order: 'Lower numbers appear first when artworks are listed.',
  description: 'Main visitor-facing description of the artwork.',
  technique: 'How the artwork was made, such as layered acrylic with wood-burning.',
  palette: 'One colour per line. Use hex values, for example #C58A22.',
  features: 'One visitor-facing selling point per line.',
  materials: 'One material per line.',
  tags: 'One keyword per line to help organise related artworks.',
  available: 'Turn off when the artwork is sold or unavailable for orders.',
  status: 'For sale adds the artwork to the cart. Exhibition only keeps it visible without selling it. Sold marks it unavailable.',
  featured: 'Show this artwork in the featured selection on the home page.',
  images: 'Add one or more clear JPEG, PNG, or WebP images. The first image becomes the main image.',
}

function FieldHelp({ text }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <span tabIndex={0} aria-label={text} className="inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        <Info size={14} aria-hidden="true" />
      </span>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded bg-ink px-3 py-2 text-center text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  )
}

function categoryKey(label) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
    status: artwork.status || (artwork.available ? 'for_sale' : 'sold'),
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
  const [customCategories, setCustomCategories] = useState([])
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    adminFetch('/artworks')
      .then((artworks) => {
        const existing = artworks
          .filter((artwork) => artwork.category && artwork.category_label)
          .map((artwork) => ({ value: artwork.category, label: artwork.category_label }))
        setCustomCategories(existing)
      })
      .catch(() => {})
  }, [])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateCategory = (category) => {
    const option = CATEGORY_OPTIONS.find((item) => item.value === category)
    setForm((current) => ({ ...current, category, category_label: option?.label || current.category_label }))
  }
  const addCategory = () => {
    const label = newCategoryLabel.trim()
    const value = categoryKey(label)
    if (!label || !value) return
    setCustomCategories((current) => [...current, { value, label }])
    setForm((current) => ({ ...current, category: value, category_label: label }))
    setNewCategoryLabel('')
    setAddingCategory(false)
  }
  const updateLines = (field, value) => update(field, value.split('\n').map((line) => line.trim()).filter(Boolean))
  const addFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles).filter((file) => file.type.startsWith('image/'))
    setFiles((current) => [...current, ...nextFiles])
  }

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

  const categoryOptions = Array.from(
    new Map([
      ...CATEGORY_OPTIONS,
      ...customCategories.filter((option) => !CATEGORY_OPTIONS.some((defaultOption) => defaultOption.value === option.value)),
    ].map((option) => [option.value, option])).values(),
  )

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
            ['title', 'Title', true], ['slug', 'Slug', false], ['medium', 'Medium', true],
            ['dimensions', 'Dimensions', false], ['price', 'Price', true], ['alt', 'Alt text', true],
          ].map(([field, label, required]) => (
            <label key={field} className="block text-sm text-neutral-700">
              <span>{label}<FieldHelp text={FIELD_HELP[field]} /></span>
              <input required={required} type={field === 'price' ? 'number' : 'text'} step={field === 'price' ? '0.01' : undefined} value={form[field]} onChange={(event) => update(field, event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" />
            </label>
          ))}
          <label className="block text-sm text-neutral-700">
            <span>Category<FieldHelp text={FIELD_HELP.category} /></span>
            <select required value={addingCategory ? CUSTOM_CATEGORY_VALUE : form.category} onChange={(event) => {
              if (event.target.value === CUSTOM_CATEGORY_VALUE) {
                setAddingCategory(true)
                return
              }
              setAddingCategory(false)
              updateCategory(event.target.value)
            }} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2">
              <option value="" disabled>Select a category</option>
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              <option value={CUSTOM_CATEGORY_VALUE}>Add a category...</option>
            </select>
            {addingCategory && (
              <div className="mt-3 flex gap-2">
                <input value={newCategoryLabel} onChange={(event) => setNewCategoryLabel(event.target.value)} placeholder="New category name" className="min-w-0 flex-1 rounded border border-neutral-300 bg-white px-3 py-2" />
                <button type="button" onClick={addCategory} disabled={!newCategoryLabel.trim()} className="rounded border border-neutral-300 px-3 text-sm font-medium text-neutral-700 disabled:opacity-50">Add</button>
              </div>
            )}
          </label>
          <label className="block text-sm text-neutral-700"><span>Aspect<FieldHelp text={FIELD_HELP.aspect} /></span><select required value={form.aspect} onChange={(event) => update('aspect', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option></select></label>
          <label className="block text-sm text-neutral-700"><span>Sort order<FieldHelp text={FIELD_HELP.sort_order} /></span><input type="number" min="0" value={form.sort_order} onChange={(event) => update('sort_order', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
        </fieldset>

        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Description</legend>
          <label className="block text-sm text-neutral-700"><span>Description<FieldHelp text={FIELD_HELP.description} /></span><textarea required rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
          <label className="block text-sm text-neutral-700"><span>Technique<FieldHelp text={FIELD_HELP.technique} /></span><textarea rows="3" value={form.technique} onChange={(event) => update('technique', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>
          {ARRAY_FIELDS.map((field) => <label key={field} className="block text-sm capitalize text-neutral-700"><span>{field}<FieldHelp text={FIELD_HELP[field]} /></span><textarea rows="3" value={form[field].join('\n')} onChange={(event) => updateLines(field, event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" /></label>)}
        </fieldset>

        <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Status and images</legend>
          <label className="block text-sm text-neutral-700"><span>Status<FieldHelp text={FIELD_HELP.status} /></span><select required value={form.status} onChange={(event) => { const status = event.target.value; update('status', status); update('available', status === 'for_sale') }} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"><option value="for_sale">For sale</option><option value="exhibition">Exhibition only</option><option value="sold">Sold</option></select></label>
          <label className="flex items-center gap-3 text-sm text-neutral-700"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} /> <span>Featured on Home<FieldHelp text={FIELD_HELP.featured} /></span></label>
          <div>
            <p className="text-sm font-medium text-neutral-700">Add images<FieldHelp text={FIELD_HELP.images} /></p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                addFiles(event.dataTransfer.files)
              }}
              className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition-colors hover:border-ink hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ImagePlus size={24} className="text-neutral-500" aria-hidden="true" />
              <span className="text-sm font-medium text-ink">Choose images or drop them here</span>
              <span className="text-xs text-neutral-500">JPEG, PNG, or WebP. You can add more than one image.</span>
            </button>
          </div>
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded border border-neutral-200 bg-white p-2">
                  <p className="truncate pr-6 text-xs font-medium text-ink" title={file.name}>{file.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{Math.ceil(file.size / 1024)} KB</p>
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                    className="absolute right-1 top-1 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="relative"><img src={`${API_URL}${image.path}`} alt="" className="aspect-square w-full rounded object-cover" /><button type="button" onClick={() => deleteImage(image)} className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs text-red-600">Delete</button></div>)}</div>}
        </fieldset>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save artwork'}</button>
      </form>
    </section>
  )
}
