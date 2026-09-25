import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_LINKS, site } from '../../data/site'
import { CloseButton } from './Navbar'

export default function MobileMenu({ open, onClose }) {
  const firstLinkRef = useRef(null)

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
        <span className="font-display text-lg font-semibold text-zinc-950">{site.artistName}</span>
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
                isActive ? 'text-zinc-950' : 'text-zinc-400'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <p className="px-8 pb-10 text-sm text-zinc-500">{site.tagline}</p>
    </div>
  )
}
