# Step-by-Step Backend Implementation Guide

This guide walks through building the Laravel backend API from scratch and connecting it to the React frontend.

---

## Phase 1: Project Setup (30 minutes)

### Step 1.1: Verify Prerequisites
```bash
# Check Node.js
node --version
# Should be 18+

# Check PHP
php --version
# Should be 8.1+

# Check Composer
composer --version
# Should be 2.x

# Check MySQL
mysql --version
# Should be 8.0+
```

### Step 1.2: Set Up MySQL Database
Follow `MYSQL_SETUP.md` to create:
- Database: `kirtanraw_gallery`
- User: `gallery_user`
- Password: `password123`

```bash
# Test connection
mysql -u gallery_user -p kirtanraw_gallery
# Password: password123
# Type: EXIT;
```

### Step 1.3: Create Laravel Project
```bash
cd kirtanraw-gallery
mkdir backend
cd backend

# Create new Laravel project
composer create-project laravel/laravel . --prefer-dist

# Result: Now you have backend/ with Laravel scaffolding
```

### Step 1.4: Configure Environment
```bash
# Copy .env template
cp .env.example .env

# Generate app key
php artisan key:generate

# Open .env and set these values:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=kirtanraw_gallery
# DB_USERNAME=gallery_user
# DB_PASSWORD=password123
```

### Step 1.5: Test Laravel Starts
```bash
php artisan serve

# Visit http://localhost:8000 in browser
# Should see Laravel welcome page
# Stop with Ctrl+C
```

---

## Phase 2: Create Database Models & Migrations (45 minutes)

### Step 2.1: Create Artist Model
```bash
php artisan make:model Artist -m

# This creates:
# - app/Models/Artist.php
# - database/migrations/XXXX_create_artists_table.php
```

Edit `database/migrations/XXXX_create_artists_table.php`:
```php
Schema::create('artists', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('bio');
    $table->json('social_links')->nullable(); // {instagram: "...", facebook: "..."}
    $table->timestamps();
});
```

Edit `app/Models/Artist.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    protected $fillable = ['name', 'bio', 'social_links'];
    protected $casts = [
        'social_links' => 'array',
    ];

    public function artworks()
    {
        return $this->hasMany(Artwork::class);
    }
}
```

### Step 2.2: Create Artwork Model
```bash
php artisan make:model Artwork -m
```

Edit `database/migrations/XXXX_create_artworks_table.php`:
```php
Schema::create('artworks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('artist_id')->constrained()->onDelete('cascade');
    $table->string('title');
    $table->text('description');
    $table->string('image_url');
    $table->string('medium')->nullable(); // e.g., "Acrylic on Canvas"
    $table->decimal('price', 10, 2)->nullable(); // RM price
    $table->timestamps();
    $table->softDeletes(); // Soft delete support
});
```

Edit `app/Models/Artwork.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Artwork extends Model
{
    use SoftDeletes;

    protected $fillable = ['artist_id', 'title', 'description', 'image_url', 'medium', 'price'];

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }
}
```

### Step 2.3: Create Gallery Model
```bash
php artisan make:model Gallery -m
```

Edit `database/migrations/XXXX_create_galleries_table.php`:
```php
Schema::create('galleries', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->timestamps();
});

Schema::create('gallery_artwork', function (Blueprint $table) {
    $table->id();
    $table->foreignId('gallery_id')->constrained()->onDelete('cascade');
    $table->foreignId('artwork_id')->constrained()->onDelete('cascade');
    $table->integer('order')->default(0);
    $table->timestamps();
});
```

Edit `app/Models/Gallery.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = ['name', 'description'];

    public function artworks()
    {
        return $this->belongsToMany(Artwork::class)
            ->withPivot('order')
            ->orderBy('pivot_order');
    }
}
```

### Step 2.4: Run Migrations
```bash
php artisan migrate

# Output should show:
# Migrating: 2014_10_12_000000_create_users_table
# Migrating: XXXX_create_artists_table
# Migrating: XXXX_create_artworks_table
# Migrating: XXXX_create_galleries_table
# Done!
```

---

## Phase 3: Create API Controllers (45 minutes)

### Step 3.1: Create ArtworkController
```bash
php artisan make:controller Api/ArtworkController
```

Edit `app/Http/Controllers/Api/ArtworkController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Artwork;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ArtworkController extends Controller
{
    // GET /api/artworks
    public function index()
    {
        $artworks = Artwork::with('artist')->get();
        return response()->json($artworks);
    }

    // GET /api/artworks/{id}
    public function show($id)
    {
        $artwork = Artwork::with('artist')->findOrFail($id);
        return response()->json($artwork);
    }

    // POST /api/artworks (admin only)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'required|url',
            'medium' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
        ]);

        $artwork = Artwork::create($validated);
        return response()->json($artwork, 201);
    }

    // PUT /api/artworks/{id} (admin only)
    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'image_url' => 'url',
            'medium' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
        ]);

        $artwork->update($validated);
        return response()->json($artwork);
    }

    // DELETE /api/artworks/{id} (admin only)
    public function destroy($id)
    {
        $artwork = Artwork::findOrFail($id);
        $artwork->delete();
        return response()->json(null, 204);
    }
}
```

### Step 3.2: Create ArtistController
```bash
php artisan make:controller Api/ArtistController
```

Edit `app/Http/Controllers/Api/ArtistController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Artist;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ArtistController extends Controller
{
    // GET /api/artist (single artist)
    public function show()
    {
        $artist = Artist::with('artworks')->first();
        if (!$artist) {
            return response()->json(['message' => 'Artist not found'], 404);
        }
        return response()->json($artist);
    }

    // PUT /api/artist (admin only)
    public function update(Request $request)
    {
        $artist = Artist::firstOrFail();

        $validated = $request->validate([
            'name' => 'string|max:255',
            'bio' => 'string',
            'social_links' => 'nullable|array',
        ]);

        $artist->update($validated);
        return response()->json($artist);
    }
}
```

### Step 3.3: Create GalleryController
```bash
php artisan make:controller Api/GalleryController
```

Edit `app/Http/Controllers/Api/GalleryController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Gallery;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class GalleryController extends Controller
{
    // GET /api/galleries
    public function index()
    {
        $galleries = Gallery::with('artworks')->get();
        return response()->json($galleries);
    }

    // GET /api/galleries/{id}
    public function show($id)
    {
        $gallery = Gallery::with('artworks')->findOrFail($id);
        return response()->json($gallery);
    }

    // POST /api/galleries (admin only)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $gallery = Gallery::create($validated);
        return response()->json($gallery, 201);
    }
}
```

---

## Phase 4: Set Up API Routes (15 minutes)

Edit `routes/api.php` (replace entire file):
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArtworkController;
use App\Http\Controllers\Api\ArtistController;
use App\Http\Controllers\Api\GalleryController;

Route::get('/artworks', [ArtworkController::class, 'index']);
Route::get('/artworks/{id}', [ArtworkController::class, 'show']);
Route::post('/artworks', [ArtworkController::class, 'store']);
Route::put('/artworks/{id}', [ArtworkController::class, 'update']);
Route::delete('/artworks/{id}', [ArtworkController::class, 'destroy']);

Route::get('/artist', [ArtistController::class, 'show']);
Route::put('/artist', [ArtistController::class, 'update']);

Route::get('/galleries', [GalleryController::class, 'index']);
Route::get('/galleries/{id}', [GalleryController::class, 'show']);
Route::post('/galleries', [GalleryController::class, 'store']);
```

---

## Phase 5: Add Seed Data (for Testing) (20 minutes)

### Step 5.1: Create Seeders
```bash
php artisan make:seeder ArtistSeeder
php artisan make:seeder ArtworkSeeder
```

Edit `database/seeders/ArtistSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\Artist;
use Illuminate\Database\Seeder;

class ArtistSeeder extends Seeder
{
    public function run()
    {
        Artist::create([
            'name' => 'Adam Rusli',
            'bio' => 'A neurodivergent (Asperger\'s) artist creating vibrant abstract artworks...',
            'social_links' => [
                'instagram' => 'https://instagram.com/adamrusli',
                'facebook' => 'https://facebook.com/adamrusli',
                'email' => 'adam@example.com',
            ],
        ]);
    }
}
```

Edit `database/seeders/ArtworkSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\Artist;
use Illuminate\Database\Seeder;

class ArtworkSeeder extends Seeder
{
    public function run()
    {
        $artist = Artist::first();

        $artworks = [
            [
                'title' => 'Abstract Landscape',
                'description' => 'A vibrant exploration of color and form...',
                'image_url' => 'https://via.placeholder.com/400x300?text=Artwork+1',
                'medium' => 'Acrylic on Canvas',
                'price' => 150.00,
            ],
            [
                'title' => 'Digital Dreams',
                'description' => 'Exploring the intersection of art and technology...',
                'image_url' => 'https://via.placeholder.com/400x300?text=Artwork+2',
                'medium' => 'Digital Art',
                'price' => 75.00,
            ],
            // Add more artworks...
        ];

        foreach ($artworks as $artwork) {
            Artwork::create([
                ...$artwork,
                'artist_id' => $artist->id,
            ]);
        }
    }
}
```

### Step 5.2: Run Seeders
Edit `database/seeders/DatabaseSeeder.php`:
```php
public function run()
{
    $this->call([
        ArtistSeeder::class,
        ArtworkSeeder::class,
    ]);
}
```

```bash
php artisan db:seed
# Or fresh migrations + seed:
php artisan migrate:fresh --seed
```

---

## Phase 6: Test API Endpoints (20 minutes)

### Step 6.1: Start Laravel Server
```bash
php artisan serve
# Runs on http://localhost:8000
```

### Step 6.2: Test Each Endpoint

**Test GET /api/artworks:**
```bash
curl http://localhost:8000/api/artworks
# Should return JSON array of artworks
```

**Test GET /api/artworks/1:**
```bash
curl http://localhost:8000/api/artworks/1
# Should return single artwork
```

**Test GET /api/artist:**
```bash
curl http://localhost:8000/api/artist
# Should return artist bio
```

Or use **Postman/Thunder Client** GUI to test interactively.

---

## Phase 7: Connect React Frontend (30 minutes)

### Step 7.1: Update React Components

In `frontend/src/components/Catalogue.jsx`:

**Before (mock data):**
```jsx
import { MOCK_ARTWORKS } from '../data/mockArtworks';

export function Catalogue() {
  const [artworks, setArtworks] = useState(MOCK_ARTWORKS);
  return (
    <div className="grid gap-4">
      {artworks.map(art => <ArtworkCard key={art.id} artwork={art} />)}
    </div>
  );
}
```

**After (API data):**
```jsx
import { useState, useEffect } from 'react';

export function Catalogue() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/artworks')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch artworks');
        return res.json();
      })
      .then(data => {
        setArtworks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4">
      {artworks.map(art => <ArtworkCard key={art.id} artwork={art} />)}
    </div>
  );
}
```

### Step 7.2: Update About Page

In `frontend/src/pages/About.jsx`:
```jsx
import { useState, useEffect } from 'react';

export function About() {
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/artist')
      .then(res => res.json())
      .then(data => setArtist(data));
  }, []);

  if (!artist) return <div>Loading...</div>;

  return (
    <div>
      <h1>{artist.name}</h1>
      <p>{artist.bio}</p>
      {artist.social_links && (
        <div>
          {artist.social_links.instagram && (
            <a href={artist.social_links.instagram}>Instagram</a>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 7.3: Update Artwork Detail Page

In `frontend/src/pages/Artwork.jsx`:
```jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function ArtworkDetail() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/artworks/${id}`)
      .then(res => res.json())
      .then(data => setArtwork(data));
  }, [id]);

  if (!artwork) return <div>Loading...</div>;

  return (
    <div>
      <img src={artwork.image_url} alt={artwork.title} />
      <h1>{artwork.title}</h1>
      <p>{artwork.description}</p>
      <p>Medium: {artwork.medium}</p>
      <p>Price: RM {artwork.price}</p>
    </div>
  );
}
```

---

## Phase 8: Run Full Stack Locally (15 minutes)

### Step 8.1: Terminal 1 - Start React
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Step 8.2: Terminal 2 - Start Laravel
```bash
cd backend
php artisan serve
# Runs on http://localhost:8000
```

### Step 8.3: Test in Browser
1. Go to http://localhost:5173
2. Navigate to Catalogue
3. Should see artworks fetched from API
4. Click on artwork detail
5. Should see full details from API
6. Check About page - should show artist bio from API

### Step 8.4: Open Browser Console
Press F12 → Console tab
- Should see NO errors
- Should see network requests to `http://localhost:8000/api/`

---

## Phase 9: Add Admin Panel (Optional, 30 minutes)

### Step 9.1: Install Laravel Nova
```bash
composer require laravel/nova

# Purchase license at https://nova.laravel.com
# Add credentials to composer.json

php artisan nova:install
php artisan nova:publish
php artisan migrate

# Add to app/Providers/NovaServiceProvider.php:
# Nova::resources([
#     Artwork::class,
#     Artist::class,
#     Gallery::class,
# ]);
```

### Step 9.2: Access Admin Panel
- URL: http://localhost:8000/nova
- Create admin user or use existing credentials

---

## Phase 10: Deployment (When Ready)

### Step 10.1: Prepare for Production
```bash
cd backend

# Generate production key
php artisan key:generate --force

# Build for production
composer install --optimize-autoloader --no-dev

# Set environment to production
# Edit .env: APP_ENV=production
```

### Step 10.2: Deploy Options

**Option A: Heroku** (easiest for beginners)
```bash
heroku login
heroku create kirtanraw-gallery-api
git push heroku main

heroku config:set DB_CONNECTION=mysql
# Configure MySQL database URL
```

**Option B: DigitalOcean App Platform**
- Connect GitHub repo
- Auto-deploys on push
- Built-in MySQL option

**Option C: Traditional Hosting**
- Upload via FTP
- Configure .env on server
- Set up MySQL remotely

---

## Common Issues & Fixes

### "CORS error: blocked by browser"
Add to `backend/app/Http/Middleware/`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### "Database connection failed"
```bash
# Verify MySQL is running
mysql -u gallery_user -p kirtanraw_gallery

# Verify .env credentials
cat .env | grep DB_

# Re-run migrations
php artisan migrate
```

### "API returns 404"
```bash
# Check routes are defined
php artisan route:list | grep api

# Verify controller exists
ls app/Http/Controllers/Api/
```

---

## Summary Checklist

- [ ] MySQL database created
- [ ] Laravel project created in `backend/`
- [ ] Models created: Artist, Artwork, Gallery
- [ ] Migrations run successfully
- [ ] Controllers created: ArtworkController, ArtistController, GalleryController
- [ ] API routes set up in `routes/api.php`
- [ ] Seed data added (optional)
- [ ] All endpoints tested with curl/Postman
- [ ] React components updated to fetch from API
- [ ] Both frontend and backend running locally
- [ ] No console errors in browser
- [ ] Network requests showing API calls
- [ ] Ready for handoff or deployment

---

**Total time: ~4-5 hours for a developer new to Laravel. Follow in order!** 🚀
