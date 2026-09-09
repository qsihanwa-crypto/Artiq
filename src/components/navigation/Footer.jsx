import { NavLink } from 'react-router-dom'
import { Instagram, Facebook, Youtube } from 'lucide-react'
import { NAV_LINKS, site } from '../../data/site'
import Button from '../buttons/Button'
import WavyLine from '../common/WavyLine'

function TikTok(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.6 3.9v2.6c-1.2.1-2.5-.3-3.6-1v6.9c0 3.6-2.4 6.1-5.9 6.1A5.9 5.9 0 0 1 4.8 15c0-3.4 3-6 6.6-5.6v2.7c-.5-.2-1-.2-1.5-.1-1.6.2-2.6 1.5-2.4 3.2.2 1.4 1.4 2.4 2.8 2.3 1.6 0 2.7-1.2 2.7-3V3h1.5Z" />
    </svg>
  )
}

const SOCIAL_ICON = { Instagram, Facebook, YouTube: Youtube, TikTok }

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-neutral-200 bg-white pt-24 text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40">
        <WavyLine variant="arc" opacity={0.18} />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 sm:px-10">
        <h2 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Thanks
          <br />
          for taking
          <br />
          a look.
        </h2>
        <Button to="/catalogue" variant="primary" size="lg" showArrow>
          Explore the artwork
        </Button>
      </div>

      <div className="mx-auto mt-24 max-w-6xl border-t border-neutral-200 px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h3 className="footer-name select-none font-display text-6xl font-semibold tracking-tight text-ink transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-skew-x-2 hover:scale-[1.02] sm:text-7xl">
              {site.artistName}
            </h3>
            <p className="mt-4 max-w-sm text-neutral-600">{site.tagline}</p>
            <div className="mt-6 flex items-center gap-3">
              {site.social.map((s) => {
                const Icon = SOCIAL_ICON[s.label] || Instagram
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.artistName} on ${s.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-ink transition-colors hover:bg-black/5"
                  >
                    <Icon size={18} className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Explore</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className="text-neutral-700 underline-offset-4 hover:text-ink hover:underline">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Get in touch</h4>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="text-neutral-700">
                For an enquiry or a commission, message me on{' '}
                <a
                  href={site.social[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Instagram
                </a>{' '}
                or{' '}
                <a
                  href={site.social[1].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Facebook
                </a>
                .
              </li>
              <li className="text-neutral-500">{site.location}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:px-10">
          <p>© {new Date().getFullYear()} {site.artistName}. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
