import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { NAV_LINKS, site } from '../../data/site'
import { useCart } from '../../context/CartContext'
import MobileMenu from './MobileMenu'

function CartLink() {
  const { count } = useCart()
  return (
    <NavLink
      to="/cart"
      aria-label={count ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart, empty'}
      className={({ isActive }) =>
        `relative inline-flex h-11 items-center gap-2 rounded-full border border-ink bg-ink px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          isActive ? 'bg-ink-soft' : ''
        }`
      }
    >
      <ShoppingBag size={18} aria-hidden="true" />
      <span>Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold leading-none text-ink"
        >
          {count}
        </span>
      )}
    </NavLink>
  )
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-neutral-500 hover:text-ink'}`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={`absolute inset-x-3 -bottom-0.5 h-px bg-ink transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
            aria-hidden="true"
          />
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:top-6">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="glass flex w-full max-w-3xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6"
      >
        <NavLink to="/" className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
          {site.artistName}
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartLink />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5 md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  )
}

export function CloseButton({ onClose }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
      aria-label="Close menu"
    >
      <X size={24} aria-hidden="true" />
    </button>
  )
}
