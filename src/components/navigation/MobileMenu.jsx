import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_LINKS, site } from '../../data/site'
import { useCart } from '../../context/CartContext'
import { CloseButton } from './Navbar'

export default function MobileMenu({ open, onClose }) {
  const firstLinkRef = useRef(null)
  const { count } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    firstLinkRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={`fixed inset-0 z-[110] flex flex-col bg-white/95 backdrop-blur-2xl transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-lg font-semibold text-ink">{site.artistName}</span>
        <CloseButton onClose={onClose} />
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col items-start justify-center gap-2 px-8">
        {NAV_LINKS.map((link, i) => (
          <NavLink
            key={link.to}
            to={link.to}
            ref={i === 0 ? firstLinkRef : undefined}
            onClick={onClose}
            className={({ isActive }) =>
              `font-display text-5xl font-semibold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:translate-x-2 ${
                isActive ? 'text-ink' : 'text-neutral-400'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        <NavLink
          to="/cart"
          onClick={onClose}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-3 font-display text-5xl font-semibold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:translate-x-2 ${
              isActive ? 'text-ink' : 'text-neutral-400'
            }`
          }
        >
          <span>Cart</span>
          {count > 0 && (
            <span className="rounded-full bg-ink px-3 py-1 text-lg text-white">{count}</span>
          )}
        </NavLink>
      </nav>

      <p className="px-8 pb-10 text-sm text-neutral-500">{site.tagline}</p>
    </div>
  )
}
