# Development Guidelines: KirtanRaw Gallery

A fully static React site — no backend, no database. All content and images
ship in the built bundle.

## Stack

React + Vite + React Router + Tailwind CSS + GSAP (with ScrollTrigger) +
Three.js + React Three Fiber + Lottie (lottie-react) + Lucide React icons.

## Code Style & Conventions

- **Component structure:** Functional components with hooks only
- **Naming:** PascalCase for components (`ArtworkCard.jsx`), camelCase for utilities
- **File organization:** One component per file in `src/components/`
- **Styling:** Tailwind CSS utility classes (no inline styles, no CSS modules)
- **State management:** React hooks (`useState`, `useContext`) — nothing server-side
- **Comments:** Only when WHY is non-obvious, not WHAT
- **Imports:** Group imports (React → external packages → internal)

**Example:**
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArtworkCard } from './ArtworkCard';

export function Catalogue() {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    fetch('/api/artworks')
      .then(res => res.json())
      .then(data => setArtworks(data));
  }, []);

  return (
    <div className="grid gap-4">
      {artworks.map(art => <ArtworkCard key={art.id} artwork={art} />)}
    </div>
  );
}
```

---

## Content & Data

There is no API and no admin dashboard — all content lives in version-controlled
files and changes ship as a normal commit + rebuild:

- `src/data/artworks.js` — the full catalogue. Each entry's photo lives in
  `src/assets/artwork/<slug>-1.jpg` or `.webp` (resolved via `import.meta.glob`);
  add a new piece by adding its image and an object here.
- `src/data/site.js` — artist identity, socials, press features (shown on the
  About page), nav links, and the Home page's editable copy (`home_content`).
- Artist photos for Home/About live in `src/assets/images/`.

All artist content comes from dennisliew.art. Don't add details that aren't
there (media, sizes, dates, prices, quotes in the artist's voice).

To update content: edit the relevant file in `src/data/`, then `npm run dev`
to check it and `npm run build` to ship it. No migrations, no seeding, no
server restart.

## No Ordering

The site is a showcase only — no cart, prices or checkout. Enquiries go through
the artist's socials in `site.js`. Ask before adding any sales flow back.

---

## Accessibility (Non-Negotiable)

Every change must maintain:
- ✅ Keyboard navigation (Tab, Shift+Tab, Enter on interactive elements)
- ✅ Focus visible states (not hidden/removed)
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`, not `<div role="...">`)
- ✅ Alt text on all images (meaningful, not "image" or "pic")
- ✅ `prefers-reduced-motion` support (test: DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`)
- ✅ Color contrast: 4.5:1 for text, 3:1 for UI elements
- ✅ No interactive elements smaller than 44×44 pixels (mobile touch targets)

Test with:
- Keyboard only (no mouse)
- Screen reader (NVDA on Windows, VoiceOver on Mac)
- `prefers-reduced-motion: reduce` enabled
- 200% zoom

---

## Styling (Color & Visual)

### Chrome (Interface)
- Colors: White, blues (`ink` + blue-tinted `neutral-*` in `src/styles/globals.css`) for surfaces, borders and buttons; text stays black/gray (`text-zinc-*`); transparent glass only
- No colorful badges, buttons, or decorative UI elements
- Focus states: Subtle outline in gray or glass effect

### Artwork Display
- Only the artwork itself should have color
- White backgrounds for gallery views
- Dark backgrounds for detailed artwork pages
- Glass/frosted effects for overlays (artist name, descriptions)

**Don't:** Add colorful call-to-action buttons, bright badges, or colored accents
**Do:** Let artwork be the star; UI stays invisible

---

## Local Development & Deployment

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs static site to dist/
npm run preview   # serve the production build locally
```

`dist/` is a plain static bundle (HTML/CSS/JS + images) — deploy it to any
static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3, etc.). Since
this is a client-side-routed SPA, configure the host to fall back to
`index.html` for unknown paths (e.g. Netlify's `_redirects`: `/* /index.html 200`).

---

## Git Workflow

1. **Branch naming:** `feature/add-artwork`, `fix/cart-total`, `docs/update-readme`
2. **Commit messages:** Clear, present tense: "Add new artwork entries", "Fix cart subtotal rounding"
3. **PR checklist:**
   - [ ] Code follows style guidelines
   - [ ] Accessibility maintained (keyboard nav, focus states, alt text)
   - [ ] No console errors/warnings
   - [ ] Tested in both light and dark mode
   - [ ] Tested with `prefers-reduced-motion: reduce`
   - [ ] No breaking changes to routes or data shapes

---

## No Magic Rules

**Don't:**
- Invent artist details (exhibitions, awards, credentials)
- Use real social media URLs unless confirmed
- Add unconfirmed features (real payment processing, user accounts, messaging)
- Change the white-and-blue color scheme
- Remove accessibility features for "cleaner UI"
- Add complex animations without fallbacks

**Do:**
- Keep artist identity and copy consistent with `src/data/site.js`
- Use the real photos already in `src/assets/artwork/`
- Ask before adding major new features
- Test accessibility before PRs
