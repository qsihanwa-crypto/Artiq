import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { login } from './api'
import { useAdminAuth } from './AdminAuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setAuthed } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      setAuthed(true)
      navigate('/admin', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto mt-32 max-w-sm px-6">
      <form onSubmit={handleSubmit}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Kirtanraw Gallery</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Admin sign in</h1>
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        <label className="mt-8 block text-sm text-neutral-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm text-neutral-700">
          Password
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((visible) => !visible)}
            className="relative float-right -mt-9 mr-3 text-neutral-500 hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
