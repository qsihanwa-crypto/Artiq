import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { adminFetch } from './api'

const EMPTY_SETTINGS = {
  artist_name: '',
  short_name: '',
  tagline: '',
  location: '',
  currency: 'MYR',
  social_links: [],
  nav_links: [],
}

const EMPTY_SOCIAL = { label: '', href: '', handle: '' }
const EMPTY_NAV = { label: '', to: '' }

export default function AdminSite() {
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    adminFetch('/settings')
      .then((data) => setSettings({ ...EMPTY_SETTINGS, ...data, social_links: data.social_links || [], nav_links: data.nav_links || [] }))
      .catch(() => setError('The Site-wide settings could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  const updateRow = (field, index, key, value) => {
    update(field, settings[field].map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row))
  }

  const saveSetting = (key) => adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ key, value: settings[key] }) })

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await Promise.all(['artist_name', 'short_name', 'tagline', 'location', 'currency', 'social_links', 'nav_links'].map(saveSetting))
      setMessage('Site-wide settings saved.')
    } catch (saveError) {
      setError(saveError.message || 'The Site-wide settings could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage('')
    try {
      await adminFetch('/password', { method: 'PUT', body: JSON.stringify(passwords) })
      setPasswords({ current_password: '', new_password: '' })
      setPasswordMessage('Password updated.')
    } catch (passwordError) {
      setPasswordMessage(passwordError.message || 'Password could not be updated.')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) return <p className="text-neutral-600">Loading Site-wide settings...</p>

  return (
    <section className="max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin / Site-wide</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Site-wide editor</h1>
      <p className="mt-3 text-neutral-600">Edit the identity, navigation, and links shared across the public site.</p>

      <form onSubmit={save} className="mt-10 space-y-10">
        <fieldset className="grid gap-5 border-t border-neutral-200 pt-6 sm:grid-cols-2">
          <legend className="mb-2 font-display text-2xl font-semibold text-ink">Identity</legend>
          {[
            ['artist_name', 'Artist name'], ['short_name', 'Short name'], ['tagline', 'Tagline'], ['location', 'Location'], ['currency', 'Currency'],
          ].map(([field, label]) => (
            <label key={field} className="block text-sm text-neutral-700">
              {label}
              <input required value={settings[field]} onChange={(event) => update(field, event.target.value)} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2" />
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Social links</legend>
          {settings.social_links.map((link, index) => (
            <div key={`social-${index}`} className="grid gap-3 border-b border-neutral-100 pb-5 sm:grid-cols-[1fr_2fr_1fr_auto]">
              {['label', 'href', 'handle'].map((field) => <input key={field} aria-label={`Social ${field}`} placeholder={field} value={link[field] || ''} onChange={(event) => updateRow('social_links', index, field, event.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" />)}
              <button type="button" onClick={() => update('social_links', settings.social_links.filter((_, rowIndex) => rowIndex !== index))} className="text-left text-sm text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => update('social_links', [...settings.social_links, { ...EMPTY_SOCIAL }])} className="text-sm font-medium text-neutral-700 underline underline-offset-4">Add social link</button>
        </fieldset>

        <fieldset className="space-y-5 border-t border-neutral-200 pt-6">
          <legend className="font-display text-2xl font-semibold text-ink">Navigation links</legend>
          {settings.nav_links.map((link, index) => (
            <div key={`nav-${index}`} className="grid gap-3 border-b border-neutral-100 pb-5 sm:grid-cols-[1fr_2fr_auto]">
              {['label', 'to'].map((field) => <input key={field} aria-label={`Navigation ${field}`} placeholder={field === 'to' ? '/path' : field} value={link[field] || ''} onChange={(event) => updateRow('nav_links', index, field, event.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" />)}
              <button type="button" onClick={() => update('nav_links', settings.nav_links.filter((_, rowIndex) => rowIndex !== index))} className="text-left text-sm text-red-600">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => update('nav_links', [...settings.nav_links, { ...EMPTY_NAV }])} className="text-sm font-medium text-neutral-700 underline underline-offset-4">Add navigation link</button>
        </fieldset>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Site-wide settings'}</button>
      </form>

      <form onSubmit={changePassword} className="mt-14 max-w-xl space-y-5 border-t border-neutral-200 pt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Change password</h2>
        <label className="block text-sm text-neutral-700">
          Current password
          <input required type={showPasswords.current ? 'text' : 'password'} value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 pr-10" />
          <button type="button" aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'} title={showPasswords.current ? 'Hide current password' : 'Show current password'} onClick={() => setShowPasswords((current) => ({ ...current, current: !current.current }))} className="relative float-right -mt-9 mr-3 text-neutral-500 hover:text-ink">
            {showPasswords.current ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </label>
        <label className="block text-sm text-neutral-700">
          New password
          <input required minLength="8" type={showPasswords.next ? 'text' : 'password'} value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 pr-10" />
          <button type="button" aria-label={showPasswords.next ? 'Hide new password' : 'Show new password'} title={showPasswords.next ? 'Hide new password' : 'Show new password'} onClick={() => setShowPasswords((current) => ({ ...current, next: !current.next }))} className="relative float-right -mt-9 mr-3 text-neutral-500 hover:text-ink">
            {showPasswords.next ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </label>
        {passwordMessage && <p className="text-sm text-neutral-600" role="status">{passwordMessage}</p>}
        <button type="submit" disabled={passwordSaving} className="rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-700 disabled:opacity-60">{passwordSaving ? 'Updating...' : 'Update password'}</button>
      </form>
    </section>
  )
}
