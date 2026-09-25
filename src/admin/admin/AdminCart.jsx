import { useEffect, useState } from 'react'
import { adminFetch } from './api'
import { buildOrderMessage } from '../utils/whatsappOrder'

const DEFAULT_MESSAGE = {
  greeting: "Hi {artist_name}, I'd like to order the following:",
  signoff: "Sent from {artist_name}'s catalogue",
}

const PREVIEW_SETTINGS = {
  artist_name: 'Kirtanraw Subramanian',
  whatsapp_number: '',
  checkout_message: DEFAULT_MESSAGE,
}

const PREVIEW_ITEMS = [
  { title: 'Example artwork', medium: 'Acrylic on canvas', dimensions: 'Dimensions on request', price: 500 },
]

export default function AdminCart() {
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    adminFetch('/settings')
      .then((settings) => {
        setNumber(String(settings.whatsapp_number || ''))
        setMessage({ ...DEFAULT_MESSAGE, ...(settings.checkout_message || {}) })
      })
      .catch(() => setError('The Cart & Checkout settings could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const updateMessage = (field, value) => {
    setMessage((current) => ({ ...current, [field]: value }))
    setSaved('')
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved('')
    try {
      await adminFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ key: 'whatsapp_number', value: number.replace(/\D/g, '') }),
      })
      await adminFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ key: 'checkout_message', value: message }),
      })
      setNumber(number.replace(/\D/g, ''))
      setSaved('Cart & Checkout settings saved.')
    } catch (saveError) {
      setError(saveError.message || 'The Cart & Checkout settings could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const preview = buildOrderMessage(PREVIEW_ITEMS, {
    ...PREVIEW_SETTINGS,
    whatsapp_number: number,
    checkout_message: message,
  })

  if (loading) return <p className="text-neutral-600">Loading Cart & Checkout settings...</p>

  return (
    <section className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / Cart & Checkout</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Cart & Checkout</h1>
      <p className="mt-3 text-neutral-600">Control the WhatsApp number and the message customers send with an order.</p>

      <form onSubmit={save} className="mt-10 space-y-8">
        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">WhatsApp contact</legend>
          <label className="block text-sm text-neutral-700">
            WhatsApp number
            <input
              required
              inputMode="tel"
              value={number}
              onChange={(event) => { setNumber(event.target.value); setSaved('') }}
              placeholder="60123456789"
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
            />
            <span className="mt-2 block text-xs text-neutral-500">Use the full international number without spaces or symbols.</span>
          </label>
        </fieldset>

        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Order message</legend>
          <label className="block text-sm text-neutral-700">
            Greeting
            <textarea rows="3" value={message.greeting} onChange={(event) => updateMessage('greeting', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" />
          </label>
          <label className="block text-sm text-neutral-700">
            Sign-off
            <textarea rows="3" value={message.signoff} onChange={(event) => updateMessage('signoff', event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" />
          </label>
          <p className="text-xs text-neutral-500">Use <code>{'{artist_name}'}</code> where the artist name should appear automatically.</p>
        </fieldset>

        <fieldset className="border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Message preview</legend>
          <pre className="mt-4 whitespace-pre-wrap rounded border border-neutral-200 bg-neutral-50 p-5 text-sm leading-6 text-neutral-700">{preview}</pre>
        </fieldset>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {saved && <p className="text-sm text-emerald-700" role="status">{saved}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Cart & Checkout'}
        </button>
      </form>
    </section>
  )
}
