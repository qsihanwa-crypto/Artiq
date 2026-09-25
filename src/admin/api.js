const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function adminFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    let message = `API error: ${res.status}`
    try {
      const data = await res.json()
      if (data?.message) message = data.message
      else if (data?.errors) {
        const firstError = Object.values(data.errors)[0]?.[0]
        if (firstError) message = firstError
      }
    } catch {
      // Ignore JSON parsing errors and keep the default message.
    }
    throw new Error(message)
  }

  return res.status === 204 ? null : res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error('Invalid credentials')
  const data = await res.json()
  localStorage.setItem('admin_token', data.token)
  return data
}
