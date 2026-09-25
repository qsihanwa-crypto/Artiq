import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminFetch } from './api'
import { useAdminAuth } from './AdminAuthContext'

const PAGES = [
  { to: '/admin/home', label: 'Home' },
  { to: '/admin/about', label: 'About' },
  { to: '/admin/catalogue', label: 'Catalogue' },
  { to: '/admin/cart', label: 'Cart & Checkout' },
  { to: '/admin/site', label: 'Site-wide' },
]

export default function AdminLayout() {
  const { setAuthed } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await adminFetch('/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('admin_token')
    setAuthed(false)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <aside className="w-56 shrink-0 border-r border-neutral-200 p-6">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">Admin pages</p>
        <nav aria-label="Admin navigation">
          <ul className="space-y-1">
            {PAGES.map((page) => (
              <li key={page.to}>
                <NavLink
                  to={page.to}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 text-sm ${isActive ? 'bg-ink text-white' : 'text-neutral-700 hover:bg-neutral-100'}`
                  }
                >
                  {page.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" onClick={handleLogout} className="mt-8 text-sm text-neutral-500 hover:text-ink">
          Log out
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-8"><Outlet /></main>
    </div>
  )
}
