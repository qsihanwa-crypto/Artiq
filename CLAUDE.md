# Development Guidelines: KirtanRaw Gallery

**Getting started?** See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for a step-by-step walkthrough of building the backend and connecting the frontend.

## Code Style & Conventions

### React (Frontend)
- **Component structure:** Functional components with hooks only
- **Naming:** PascalCase for components (`ArtworkCard.jsx`), camelCase for utilities
- **File organization:** One component per file in `src/components/`
- **Styling:** Tailwind CSS utility classes (no inline styles, no CSS modules)
- **State management:** React hooks (`useState`, `useContext`) for simple state; consider Zustand for global state if needed later
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

### Laravel (Backend)
- **Naming:** PascalCase for models/controllers (`Artwork.php`), snake_case for database columns
- **Models:** Use Eloquent relationships (hasMany, belongsTo, etc.)
- **Controllers:** Keep methods simple, one responsibility per method
- **API responses:** Always return JSON, use standard HTTP status codes (200, 201, 404, 500)
- **Validation:** Use Laravel's built-in validators, return 422 for validation errors
- **Comments:** Docblocks for public methods only

**Example:**
```php
// app/Models/Artwork.php
class Artwork extends Model {
  protected $fillable = ['title', 'description', 'image_url', 'artist_id'];
  
  public function artist() {
    return $this->belongsTo(Artist::class);
  }
}

// app/Http/Controllers/ArtworkController.php
class ArtworkController extends Controller {
  public function index() {
    return response()->json(Artwork::with('artist')->get());
  }
  
  public function show($id) {
    $artwork = Artwork::findOrFail($id);
    return response()->json($artwork);
  }
}
```

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
- Colors: White, black, grays, transparent glass only
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

## Database Schema Conventions

- **Primary key:** `id` (auto-incrementing)
- **Timestamps:** Always include `created_at`, `updated_at` (Laravel handles automatically)
- **Foreign keys:** Singular `artist_id` not `artists_id`
- **Soft deletes:** Use `SoftDeletes` trait for artworks (don't hard-delete)
- **Image paths:** Store as URLs or relative paths (`/storage/...`), never absolute file paths

**Essential tables** (see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) Phase 2 for full migrations):
- `site_settings` (id, key UNIQUE, value JSON) — flexible key/value store for everything that isn't an artwork: artist name, tagline, location, currency, **WhatsApp order number**, social links, nav links. Add new content here first before reaching for a new column/table.
- `artworks` (id, slug, title, medium, category, category_label, dimensions, aspect, palette JSON, description, features JSON, price, available, materials JSON, technique, tags JSON, alt, sort_order) + soft deletes
- `artwork_images` (id, artwork_id, path, sort_order) — one row per photo, uploaded via the admin dashboard
- `process_steps` / `steady_items` (About page content) and `how_i_see_pieces` (Home page content) — each references an `artwork_id`
- `users` (Laravel default) + Sanctum's `personal_access_tokens` — single admin login, no roles/permissions needed

---

## API Conventions

### Endpoint Structure

Public (no auth):
```
GET    /api/artworks              → List available artworks
GET    /api/artworks/{slug}       → Get single artwork
GET    /api/settings              → All site settings (name, tagline, socials, WhatsApp number, ...)
GET    /api/about                 → Process steps + steady items
GET    /api/how-i-see             → Home page "How I See" pieces
```

Admin (behind `auth:sanctum`, Bearer token — see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) Phases 3 & 5):
```
POST   /api/admin/login           → Get a token
GET    /api/admin/artworks        → List all artworks (incl. soft-deleted)
POST   /api/admin/artworks        → Create (multipart, supports image upload)
PUT    /api/admin/artworks/{id}             → Update
DELETE /api/admin/artworks/{id}             → Soft delete
PATCH  /api/admin/artworks/{id}/availability → Mark sold / available (Catalogue admin page)
PATCH  /api/admin/artworks/{id}/featured     → Toggle Home's Featured Artwork picks (Home admin page)
PUT    /api/admin/settings                  → Update one setting: { key, value }
```
The admin dashboard is organized one page per public page (Home, About,
Catalogue, Cart & Checkout, Site-wide) rather than by table — see
[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) Phase 10 for the mapping
and the `site_settings` keys (`home_content`, `checkout_message`, etc.) each
page reads and writes.

Never add an admin-only mutation without `auth:sanctum` on the route — there is no other gate.

### Response Format
**Success (200):**
```json
{
  "id": 1,
  "title": "Abstract Landscape",
  "description": "...",
  "image_url": "/images/artwork-1.jpg",
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Error (404):**
```json
{
  "message": "Artwork not found"
}
```

**Validation Error (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"]
  }
}
```

---

## MySQL & Environment Setup

### Backend (.env) — MySQL Configuration
```
APP_ENV=local
APP_DEBUG=true

# MySQL Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kirtanraw_gallery
DB_USERNAME=gallery_user
DB_PASSWORD=password123

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Database Credentials
- **Host:** `127.0.0.1` (localhost)
- **Port:** `3306` (default MySQL port)
- **Database:** `kirtanraw_gallery`
- **User:** `gallery_user`
- **Password:** `password123`

These must match the MySQL user created during setup.

### Frontend (.env or vite.config.js)
```
VITE_API_URL=http://localhost:8000
```

---

## Git Workflow

1. **Branch naming:** `feature/add-artwork-model`, `fix/cors-error`, `docs/update-readme`
2. **Commit messages:** Clear, present tense: "Add artwork CRUD endpoints", "Fix image upload validation"
3. **PR checklist:**
   - [ ] Code follows style guidelines
   - [ ] Accessibility maintained (keyboard nav, focus states, alt text)
   - [ ] No console errors/warnings
   - [ ] Tested in both light and dark mode
   - [ ] Tested with `prefers-reduced-motion: reduce`
   - [ ] No breaking changes to existing APIs

---

## Testing (Backend)

Use Laravel's built-in testing:
```bash
php artisan make:test ArtworkControllerTest
php artisan test
```

Test at minimum:
- API endpoints return correct status codes
- Validation rejects invalid data
- Authentication/authorization works (when added)

---

## No Magic Rules

**Don't:**
- Invent artist details (exhibitions, awards, credentials)
- Use real social media URLs unless confirmed
- Add unconfirmed features (e-commerce, user accounts, messaging)
- Change monochrome color scheme
- Remove accessibility features for "cleaner UI"
- Add complex animations without fallbacks

**Do:**
- Use placeholder names ("Adam Rusli") consistently
- Use placeholder images from `src/assets/artwork/`
- Ask before adding major new features
- Test accessibility before PRs
- Document API changes

---

## Local Environment Checklist

- [ ] Node.js 18+ installed
- [ ] PHP 8.1+ installed
- [ ] Composer installed
- [ ] **MySQL 8.0+ installed and running**
- [ ] MySQL database `kirtanraw_gallery` created
- [ ] MySQL user `gallery_user` created with password
- [ ] Frontend dependencies: `npm install` in `frontend/`
- [ ] Backend dependencies: `composer install` in `backend/`
- [ ] `.env` file configured with MySQL credentials:
  - `DB_HOST=127.0.0.1`
  - `DB_DATABASE=kirtanraw_gallery`
  - `DB_USERNAME=gallery_user`
  - `DB_PASSWORD=password123`
- [ ] `php artisan key:generate` run
- [ ] `php artisan migrate` run successfully
- [ ] Frontend dev server: `npm run dev` → http://localhost:5173
- [ ] Backend dev server: `php artisan serve` → http://localhost:8000

---

**Questions? Check HANDOFF.md or PRODUCT.md first.** 🎨
