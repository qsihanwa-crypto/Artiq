# Project Handoff Guide: KirtanRaw Art Gallery

## 📋 Project Overview

**What it is:** A beautiful digital art gallery website for artist Adam Rusli (placeholder name). Showcases artwork, tells his story, and accepts donations. Public-facing, no user accounts.

**Current state:** React frontend is ~80% complete with mock artwork data. Needs Laravel backend CMS to manage real content.

**Tech Stack:**
- **Frontend:** React 18 + Vite + React Router + Tailwind CSS + Three.js (3D) + GSAP animations
- **Backend:** Laravel (to be built) with MySQL/PostgreSQL
- **Admin UI:** Laravel Nova or Filament (for artist to manage content)

---

## 🚀 What You Need (Prerequisites)

### Required
- **Node.js 18+** (for React frontend)
- **PHP 8.1+** (for Laravel backend)
- **Composer** (PHP package manager)
- **MySQL 8.0+** (database) — **Required**
- **Git** (version control)

### Recommended Tools
- **VS Code** with extensions: Tailwind CSS IntelliSense, Thunder Client (API testing)
- **MySQL Workbench** or **Sequel Pro/TablePlus** (MySQL GUI)
- **Laravel Valet** or **Docker** (for local Laravel development)
- **Postman** or **Thunder Client** (test API endpoints)

---

## 📁 Project Structure (Post-Handoff)

```
kirtanraw-gallery/
├── frontend/                    # React app (existing)
│   ├── src/
│   │   ├── components/         # React components (Hero, Gallery, Artwork, etc.)
│   │   ├── pages/              # Page routes (/about, /catalogue, /donate)
│   │   ├── assets/artwork/     # Placeholder images (will be replaced by CMS)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Laravel app (to be created)
│   ├── app/
│   │   ├── Models/             # Eloquent models (Artwork, Gallery, Artist)
│   │   └── Http/
│   │       └── Controllers/    # API controllers
│   ├── database/
│   │   └── migrations/         # Database schema
│   ├── routes/
│   │   └── api.php             # API endpoints
│   ├── .env.example            # Environment template
│   └── composer.json
│
├── HANDOFF.md                  # This file
├── CLAUDE.md                   # Development guidelines (if exists)
└── README.md                   # General project info
```

---

## 🛠️ Setup Instructions

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd kirtanraw-gallery
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. MySQL Setup
```bash
# Windows: Use MySQL Installer
# Mac: brew install mysql
# Linux: sudo apt-get install mysql-server

# Start MySQL service
# Windows: mysql is usually auto-running
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Create database and user
mysql -u root -p
# Enter root password (or blank if no password set)

# In MySQL console:
CREATE DATABASE kirtanraw_gallery;
CREATE USER 'gallery_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON kirtanraw_gallery.* TO 'gallery_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Backend Setup (Laravel)
```bash
cd backend

# If backend folder doesn't exist yet:
composer create-project laravel/laravel . --prefer-dist

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env file:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kirtanraw_gallery
DB_USERNAME=gallery_user
DB_PASSWORD=password123

# Run migrations (creates database tables)
php artisan migrate

# Start Laravel server (runs on http://localhost:8000)
php artisan serve
```

### 5. Verify Everything Is Running
```bash
# In one terminal:
cd frontend && npm run dev
# Check: http://localhost:5173

# In another terminal:
cd backend && php artisan serve
# Check: http://localhost:8000/api/artworks (should show empty [] if no data yet)

# In MySQL:
mysql -u gallery_user -p
# Password: password123
# SHOW DATABASES; # Should see kirtanraw_gallery
# USE kirtanraw_gallery;
# SHOW TABLES; # Should see Laravel system tables
```

---

## 📝 Your Workflow

### Daily Development

**Frontend Changes:**
```bash
cd frontend
npm run dev              # Watch mode (auto-reload)
# Make changes to components/pages
# Browser auto-refreshes
```

**Backend Changes:**
```bash
cd backend
php artisan serve       # Watch mode
# Make changes to models/controllers
# Restart if needed with Ctrl+C then rerun
```

### Creating Database Models (Backend Tasks)

**Example: Add an Artwork model**
```bash
cd backend

# Generate model with migration
php artisan make:model Artwork -m

# Edit: app/Models/Artwork.php (define properties)
# Edit: database/migrations/XXXX_create_artworks_table.php (define columns)

# Run migration
php artisan migrate
```

### Creating API Endpoints (Backend)

**Example: Get all artworks**
```php
// routes/api.php
Route::get('/artworks', [ArtworkController::class, 'index']);

// app/Http/Controllers/ArtworkController.php
public function index() {
    return Artwork::all();
}
```

### Connecting Frontend to Backend

Replace mock data in React with API calls:

```javascript
// Before (mock data)
const [artworks, setArtworks] = useState(MOCK_ARTWORKS);

// After (API call)
useEffect(() => {
  fetch('http://localhost:8000/api/artworks')
    .then(res => res.json())
    .then(data => setArtworks(data));
}, []);
```

### Git Workflow
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/add-artists-bio

# Make changes to frontend OR backend
# Commit
git add .
git commit -m "Add artist bio model and endpoint"

# Push and create PR
git push origin feature/add-artists-bio
```

---

## 🎯 Key Files to Understand

| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | Main React app, routing setup |
| `frontend/src/pages/` | Route pages (Home, About, Catalogue, Artwork, Donate) |
| `frontend/src/components/` | Reusable UI components |
| `backend/routes/api.php` | All API endpoint definitions |
| `backend/app/Models/` | Database models (Artwork, Gallery, Artist) |
| `backend/database/migrations/` | Database schema definitions |
| `PRODUCT.md` | Design vision, accessibility requirements |

---

## 📊 Architecture Flow

```
Browser (React Frontend)
    ↓
http://localhost:5173 (Vite dev server)
    ↓
Component renders → Needs data
    ↓
fetch('http://localhost:8000/api/artworks')
    ↓
Laravel API
    ↓
Database (MySQL/PostgreSQL)
    ↓
Returns JSON
    ↓
React renders data
```

---

## ✅ Must-Do Tasks (Priority Order)

1. **Install PHP & Composer** (if not already)
2. **Create Laravel backend** folder and scaffold
3. **Set up database** (MySQL or PostgreSQL locally)
4. **Create models:** Artwork, Gallery, Artist, Image
5. **Create migrations** (define database schema)
6. **Build API endpoints** (GET /artworks, GET /artworks/:id, GET /artist, etc.)
7. **Connect React frontend** to backend API (replace mock data)
8. **Set up admin panel** (Laravel Nova or Filament)
9. **Test end-to-end** (add artwork in admin, see it on frontend)
10. **Deploy** (backend to hosting, frontend to Vercel/Netlify)

---

## 🔑 Key Design Decisions to Respect

- **Monochrome chrome, colorful artworks:** UI (nav, footer, chrome) stays white/black/gray. Color enters ONLY through artwork. Don't add colorful buttons/badges.
- **Accessibility first:** Every interactive element needs keyboard support, focus states, alt text. Test with `Tab` key navigation.
- **Reduced motion support:** Respect `prefers-reduced-motion` media query. Animations should have accessible fallbacks.
- **Placeholder content:** Artist name "Adam Rusli" and artwork images are placeholders. Don't fabricate real details.

See `PRODUCT.md` for full design philosophy.

---

## 🐛 Troubleshooting

**Frontend won't start:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Laravel won't start:**
```bash
cd backend
composer install
php artisan key:generate
php artisan serve
```

**MySQL not running:**
```bash
# Windows: Check Services (Win+R → services.msc → look for MySQL)
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Verify connection:
mysql -u gallery_user -p
# Password: password123
```

**Database connection errors:**
- Verify `.env` has correct credentials
- Check MySQL is running: `mysql -u gallery_user -p`
- Database exists: `mysql -u gallery_user -p -e "SHOW DATABASES;"`
- Run migrations: `php artisan migrate`

**Reset database (dev only):**
```bash
php artisan migrate:fresh  # Drops all tables and re-runs migrations
# Or from MySQL directly:
mysql -u gallery_user -p
DROP DATABASE kirtanraw_gallery;
CREATE DATABASE kirtanraw_gallery;
EXIT;
php artisan migrate
```

**API not responding:**
- Check Laravel is running: `php artisan serve`
- Test endpoint: Visit `http://localhost:8000/api/artworks` in browser
- Check for errors: `php artisan tinker` → `Artwork::all()`

---

## 📚 Project Documents

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** — Detailed step-by-step walkthrough of building the entire backend (models, migrations, controllers, routes) and connecting React frontend. **Start here after environment setup.**
- **[MYSQL_SETUP.md](MYSQL_SETUP.md)** — Quick reference for MySQL installation and configuration
- **[CLAUDE.md](CLAUDE.md)** — Code style, accessibility, and development guidelines

## 📖 External Learning Resources

- **Laravel Docs:** https://laravel.com/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Three.js + React Three Fiber:** https://docs.pmnd.rs/react-three-fiber/
- **Laravel Nova (Admin UI):** https://nova.laravel.com/docs

---

## 📞 Questions?

If stuck:
1. Check this handoff guide first
2. Google the error message
3. Check Laravel/React docs
4. Review `PRODUCT.md` for design context
5. Ask in Discord/Slack or open a GitHub issue

---

## 🚢 Deployment Checklist (When Ready)

- [ ] Backend deployed (Heroku, DigitalOcean, AWS, etc.)
- [ ] Frontend environment variable set (API_URL points to live backend)
- [ ] Frontend deployed (Vercel, Netlify, etc.)
- [ ] Admin panel accessible (Nova/Filament at `/admin`)
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Real content uploaded (artworks, bio, links)

---

**Good luck! You've got this.** 🎨
