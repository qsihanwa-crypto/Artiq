# Step-by-Step Backend Implementation Guide

This guide builds a Laravel + MySQL backend where **every piece of content on the
site is editable from an admin dashboard** — artworks, the WhatsApp order number,
social links, the About page copy, the home page "How I See" cards, all of it —
and connects it to the existing React frontend.

**No paid tools.** No Laravel Nova (~$99/yr), no third-party CMS, no S3. Auth uses
Laravel Sanctum (free, ships with Laravel). The admin dashboard is a small React
app you build yourself, reusing the skills already in this codebase instead of
learning Blade/Livewire for Filament. Uploaded images are stored on local disk via
Laravel's own filesystem — call this out at deploy time (see Phase 12).

**Total time: ~7-9 hours for a developer new to Laravel.** Follow in order — later
phases assume earlier ones exist.

---

## Phase 1: Project Setup (30 minutes)

### Step 1.1: Verify Prerequisites
```bash
node --version      # 18+
php --version       # 8.2+
composer --version  # 2.x
mysql --version     # 8.0+
```

### Step 1.2: Set Up MySQL Database
Follow `MYSQL_SETUP.md` to create database `kirtanraw_gallery`, user `gallery_user`,
password `password123`.

```bash
mysql -u gallery_user -p kirtanraw_gallery
# Password: password123
EXIT;
```

### Step 1.3: Create Laravel Project
```bash
cd KirtanrawGallery
mkdir backend
cd backend
composer create-project laravel/laravel . --prefer-dist
```

### Step 1.4: Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Set in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kirtanraw_gallery
DB_USERNAME=gallery_user
DB_PASSWORD=password123
```

### Step 1.5: Install Sanctum (Admin Auth)
Laravel 11+ ships Sanctum but it isn't wired up until you ask for it:
```bash
php artisan install:api
```
This publishes the Sanctum config and a migration for `personal_access_tokens`.
It's free and part of core Laravel — no package purchase needed.

### Step 1.6: Test Laravel Starts
```bash
php artisan serve
# Visit http://localhost:8000 — should see Laravel welcome page. Ctrl+C to stop.
```

---

## Phase 2: Database Models & Migrations (60 minutes)

The schema below mirrors what's already in `src/data/*.js`, so nothing is
invented — every field the frontend currently hardcodes gets a column.

### Step 2.1: `site_settings` — the everything-else table

Rather than a fixed `artists` table with fixed columns, use one flexible
key/value table. This is what makes "even the WhatsApp number" and anything
else editable without a new migration every time the artist wants a new field.

```bash
php artisan make:model SiteSetting -m
```

`database/migrations/XXXX_create_site_settings_table.php`:
```php
Schema::create('site_settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->json('value');
    $table->timestamps();
});
```

`app/Models/SiteSetting.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];
    protected $casts = ['value' => 'array'];

    /** Read one setting, or $default if it doesn't exist yet. */
    public static function get(string $key, $default = null)
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $row = static::where('key', $key)->first();
            return $row ? $row->value : $default;
        });
    }

    /** Create or overwrite one setting. */
    public static function set(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting:{$key}");
    }

    /** All settings as a flat [key => value] array, for the public API. */
    public static function allAsArray(): array
    {
        return static::all()->pluck('value', 'key')->toArray();
    }
}
```

**Settings keys this project needs** (seeded in Phase 7, editable later from
the admin dashboard):

| Key | Shape | Replaces |
|---|---|---|
| `artist_name` | string | `site.artistName` |
| `short_name` | string | `site.shortName` |
| `tagline` | string | `site.tagline` |
| `location` | string | `site.location` |
| `currency` | string | `site.currency` |
| `whatsapp_number` | string, digits only | `site.whatsapp` |
| `social_links` | array of `{label, href, handle}` | `site.social` |
| `nav_links` | array of `{label, to}` | `NAV_LINKS` |
| `checkout_message` | `{greeting, signoff}`, with a `{artist_name}` placeholder substituted at send time | the hardcoded strings in `whatsappOrder.js` |
| `home_content` | `{heroLines[3], heroSubtext, introHeadline1, introHeadline2, introBody, artistIntroParagraphs[]}` | the hardcoded JSX copy in `Home.jsx` |

The last two exist so the **Home page** and the **Cart/checkout message** are
editable from the admin dashboard too, not just the catalogue — see Phase 10's
per-page admin layout.

### Step 2.2: `artworks` + `artwork_images`

```bash
php artisan make:model Artwork -m
php artisan make:model ArtworkImage -m
```

`database/migrations/XXXX_create_artworks_table.php`:
```php
Schema::create('artworks', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->string('title');
    $table->string('medium');
    $table->string('category');
    $table->string('category_label');
    $table->string('dimensions')->default('Dimensions on request');
    $table->string('aspect')->default('portrait'); // portrait | landscape | square
    $table->json('palette')->nullable();           // ["#b48648", "#5c3930"]
    $table->text('description');
    $table->json('features')->nullable();          // string[]
    $table->decimal('price', 10, 2);
    $table->boolean('available')->default(true);
    $table->json('materials')->nullable();         // string[]
    $table->string('technique')->nullable();
    $table->json('tags')->nullable();               // string[]
    $table->string('alt');
    $table->boolean('featured')->default(false); // shows in Home's "Featured Artwork" grid
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
    $table->softDeletes();
});
```

`database/migrations/XXXX_create_artwork_images_table.php`:
```php
Schema::create('artwork_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('artwork_id')->constrained()->onDelete('cascade');
    $table->string('path'); // e.g. "/storage/artworks/slug-1.jpg"
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

`app/Models/Artwork.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Artwork extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'medium', 'category', 'category_label', 'dimensions',
        'aspect', 'palette', 'description', 'features', 'price', 'available',
        'materials', 'technique', 'tags', 'alt', 'featured', 'sort_order',
    ];

    protected $casts = [
        'palette'   => 'array',
        'features'  => 'array',
        'materials' => 'array',
        'tags'      => 'array',
        'available' => 'boolean',
        'featured'  => 'boolean',
        'price'     => 'decimal:2',
    ];

    public function images()
    {
        return $this->hasMany(ArtworkImage::class)->orderBy('sort_order');
    }
}
```

`app/Models/ArtworkImage.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArtworkImage extends Model
{
    protected $fillable = ['artwork_id', 'path', 'sort_order'];
}
```

### Step 2.3: About page content — `process_steps` and `steady_items`

```bash
php artisan make:model ProcessStep -m
php artisan make:model SteadyItem -m
```

`database/migrations/XXXX_create_process_steps_table.php`:
```php
Schema::create('process_steps', function (Blueprint $table) {
    $table->id();
    $table->string('label');
    $table->text('text');
    $table->foreignId('artwork_id')->nullable()->constrained()->nullOnDelete();
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

`database/migrations/XXXX_create_steady_items_table.php`:
```php
Schema::create('steady_items', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->text('insight');
    $table->foreignId('artwork_id')->nullable()->constrained()->nullOnDelete();
    $table->json('swatch_artwork_ids')->nullable(); // for the "Colour" card
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

Models (`ProcessStep.php`, `SteadyItem.php`) — same pattern as above, `belongsTo(Artwork::class)`,
`swatch_artwork_ids` cast to `array`.

### Step 2.4: Home page — `how_i_see_pieces`

```bash
php artisan make:model HowISeePiece -m
```

```php
Schema::create('how_i_see_pieces', function (Blueprint $table) {
    $table->id();
    $table->foreignId('artwork_id')->constrained()->onDelete('cascade');
    $table->decimal('focal_x', 5, 2)->default(50);
    $table->decimal('focal_y', 5, 2)->default(50);
    $table->decimal('focal_scale', 4, 2)->default(3);
    $table->text('insight');
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

### Step 2.5: Run All Migrations
```bash
php artisan migrate
```

---

## Phase 3: Admin Authentication (30 minutes)

One admin account is enough — this site has a single artist/owner, not a team.

### Step 3.1: Seed the Admin User
Laravel's default `users` table (created by the framework's own migration) is
all you need. Create a seeder:
```bash
php artisan make:seeder AdminUserSeeder
```

`database/seeders/AdminUserSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@kirtanraw.local'],
            ['name' => 'Admin', 'password' => Hash::make('change-me-immediately')]
        );
    }
}
```
Add `AdminUserSeeder::class` to `database/seeders/DatabaseSeeder.php`'s `run()`
call list, then run `php artisan db:seed --class=AdminUserSeeder`. **Change the
password from the admin dashboard the first time you log in** (Phase 10 adds a
"Change password" field — do not ship `change-me-immediately` to production).

### Step 3.2: AuthController
```bash
php artisan make:controller Api/AuthController
```

`app/Http/Controllers/Api/AuthController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // POST /api/admin/login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = $request->user();
        $token = $user->createToken('admin-dashboard')->plainTextToken;

        return response()->json(['token' => $token, 'user' => ['name' => $user->name, 'email' => $user->email]]);
    }

    // POST /api/admin/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // GET /api/admin/me
    public function me(Request $request)
    {
        return response()->json(['name' => $request->user()->name, 'email' => $request->user()->email]);
    }

    // PUT /api/admin/password
    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $request->user()->update(['password' => Hash::make($data['new_password'])]);
        return response()->json(['message' => 'Password updated']);
    }
}
```

This uses **Bearer tokens**, not Sanctum's cookie/SPA mode — simpler to reason
about across two different local ports (5173 and 8000) and avoids CSRF/cookie
domain issues entirely. The frontend just sends `Authorization: Bearer <token>`.

---

## Phase 4: Public API — Read-Only (30 minutes)

These endpoints need no auth; they power the public site.

```bash
php artisan make:controller Api/PublicArtworkController
php artisan make:controller Api/PublicSettingController
php artisan make:controller Api/PublicAboutController
```

`app/Http/Controllers/Api/PublicArtworkController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use Illuminate\Http\Request;

class PublicArtworkController extends Controller
{
    // GET /api/artworks               — full catalogue
    // GET /api/artworks?featured=1    — just the Home page's featured picks
    public function index(Request $request)
    {
        $query = Artwork::with('images')->where('available', true);
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }
        return $query->orderBy('sort_order')->get();
    }

    // GET /api/artworks/{slug}
    public function show($slug)
    {
        $artwork = Artwork::with('images')->where('slug', $slug)->firstOrFail();
        return response()->json($artwork);
    }
}
```

`app/Http/Controllers/Api/PublicSettingController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;

class PublicSettingController extends Controller
{
    // GET /api/settings — everything the frontend needs: name, tagline,
    // socials, nav links, and yes, the WhatsApp number.
    public function index()
    {
        return response()->json(SiteSetting::allAsArray());
    }
}
```

`app/Http/Controllers/Api/PublicAboutController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcessStep;
use App\Models\SteadyItem;
use App\Models\HowISeePiece;

class PublicAboutController extends Controller
{
    // GET /api/about
    public function index()
    {
        return response()->json([
            'processSteps' => ProcessStep::with('artwork.images')->orderBy('sort_order')->get(),
            'steadyItems'  => SteadyItem::with('artwork.images')->orderBy('sort_order')->get(),
        ]);
    }

    // GET /api/how-i-see
    public function howISee()
    {
        return response()->json(
            HowISeePiece::with('artwork.images')->orderBy('sort_order')->get()
        );
    }
}
```

Add the `artwork()` relation to `ProcessStep`, `SteadyItem`, and `HowISeePiece`
models (`belongsTo(Artwork::class)`).

The WhatsApp number never needs its own dedicated endpoint or special-casing —
it's just another value in the `site_settings` blob, exactly like the tagline.
That's the point of Phase 2.1.

---

## Phase 5: Admin API — Protected CRUD (60 minutes)

Everything here sits behind `auth:sanctum` middleware.

```bash
php artisan make:controller Api/Admin/ArtworkController
php artisan make:controller Api/Admin/SettingController
php artisan make:controller Api/Admin/AboutController
```

`app/Http/Controllers/Api/Admin/ArtworkController.php`:
```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\ArtworkImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArtworkController extends Controller
{
    public function index()
    {
        return Artwork::with('images')->withTrashed()->orderBy('sort_order')->get();
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);
        $artwork = Artwork::create($validated);
        $this->attachUploadedImages($request, $artwork);
        return response()->json($artwork->load('images'), 201);
    }

    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $artwork->update($this->validated($request, $id));
        $this->attachUploadedImages($request, $artwork);
        return response()->json($artwork->load('images'));
    }

    public function destroy($id)
    {
        Artwork::findOrFail($id)->delete(); // soft delete
        return response()->json(null, 204);
    }

    // PATCH /api/admin/artworks/{id}/availability — one-click "Mark Sold" /
    // "Mark Available" from the list view. Separate from update() so the
    // artist can flip this from a list row without opening the full edit
    // form and re-sending every field.
    public function toggleAvailability(Request $request, $id)
    {
        $data = $request->validate(['available' => 'required|boolean']);
        $artwork = Artwork::findOrFail($id);
        $artwork->update($data);
        return response()->json($artwork);
    }

    // PATCH /api/admin/artworks/{id}/featured — same idea, for the Home
    // page's Featured Artwork checklist (Step 10.4). Its own tiny endpoint
    // means that page never needs to fetch/resend the whole artwork record
    // just to flip one flag.
    public function toggleFeatured(Request $request, $id)
    {
        $data = $request->validate(['featured' => 'required|boolean']);
        $artwork = Artwork::findOrFail($id);
        $artwork->update($data);
        return response()->json($artwork);
    }

    public function deleteImage($artworkId, $imageId)
    {
        $image = ArtworkImage::where('artwork_id', $artworkId)->findOrFail($imageId);
        Storage::disk('public')->delete(str_replace('/storage/', '', $image->path));
        $image->delete();
        return response()->json(null, 204);
    }

    private function validated(Request $request, $id = null): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:artworks,slug' . ($id ? ",{$id}" : ''),
            'medium' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'category_label' => 'required|string|max:100',
            'dimensions' => 'nullable|string|max:255',
            'aspect' => 'required|in:portrait,landscape,square',
            'palette' => 'nullable|array',
            'description' => 'required|string',
            'features' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'available' => 'boolean',
            'materials' => 'nullable|array',
            'technique' => 'nullable|string',
            'tags' => 'nullable|array',
            'alt' => 'required|string|max:255',
            'featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);
    }

    private function attachUploadedImages(Request $request, Artwork $artwork): void
    {
        if (!$request->hasFile('images')) return;

        $nextOrder = $artwork->images()->max('sort_order') + 1;
        foreach ($request->file('images') as $file) {
            $path = $file->store('artworks', 'public');
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => '/storage/' . $path,
                'sort_order' => $nextOrder++,
            ]);
        }
    }
}
```

`app/Http/Controllers/Api/Admin/SettingController.php`:
```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // GET /api/admin/settings — same shape as the public one, for the form
    public function index()
    {
        return response()->json(SiteSetting::allAsArray());
    }

    // PUT /api/admin/settings — body: { "key": "whatsapp_number", "value": "60123456789" }
    public function update(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string|max:100',
            'value' => 'required',
        ]);

        SiteSetting::set($data['key'], $data['value']);
        return response()->json(['key' => $data['key'], 'value' => $data['value']]);
    }
}
```

`app/Http/Controllers/Api/Admin/AboutController.php` — standard CRUD for
`ProcessStep` and `SteadyItem` (index/store/update/destroy), same shape as
`ArtworkController` above but without image uploads. Omitted here for length —
copy the `ArtworkController` pattern, dropping `attachUploadedImages`.

### Storage Setup
```bash
php artisan storage:link
```
This symlinks `storage/app/public` to `public/storage` so uploaded images are
served as static files at `http://localhost:8000/storage/artworks/...`.

---

## Phase 6: API Routes (15 minutes)

Replace `routes/api.php` entirely:
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicArtworkController;
use App\Http\Controllers\Api\PublicSettingController;
use App\Http\Controllers\Api\PublicAboutController;
use App\Http\Controllers\Api\Admin\ArtworkController as AdminArtworkController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\AboutController as AdminAboutController;

// --- Public (read-only, no auth) ---
Route::get('/artworks', [PublicArtworkController::class, 'index']);
Route::get('/artworks/{slug}', [PublicArtworkController::class, 'show']);
Route::get('/settings', [PublicSettingController::class, 'index']);
Route::get('/about', [PublicAboutController::class, 'index']);
Route::get('/how-i-see', [PublicAboutController::class, 'howISee']);

// --- Admin auth ---
Route::post('/admin/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    Route::apiResource('artworks', AdminArtworkController::class);
    Route::patch('/artworks/{id}/availability', [AdminArtworkController::class, 'toggleAvailability']);
    Route::patch('/artworks/{id}/featured', [AdminArtworkController::class, 'toggleFeatured']);
    Route::delete('/artworks/{artwork}/images/{image}', [AdminArtworkController::class, 'deleteImage']);

    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::put('/settings', [AdminSettingController::class, 'update']);

    Route::apiResource('process-steps', AdminAboutController::class);
});
```

### CORS
Edit `backend/config/cors.php`:
```php
'paths' => ['api/*', 'storage/*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'supports_credentials' => false, // Bearer tokens, not cookies
```

---

## Phase 7: Import the Real Catalogue (45 minutes)

The site already has 20+ real artworks in `src/data/artworks.js`, real bio
content in `about.js`/`howISee.js`, and the real settings shape in `site.js`.
Import that data instead of writing fake seed data — this is a one-time
migration, not a demo.

### Step 7.1: Copy the Images
```bash
mkdir -p backend/storage/app/public/artworks
cp src/assets/artwork/*.jpg backend/storage/app/public/artworks/
```

### Step 7.2: Settings Seeder
```bash
php artisan make:seeder SiteSettingSeeder
```
Copy the values straight out of `src/data/site.js`:
```php
<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run()
    {
        SiteSetting::set('artist_name', 'Kirtanraw Subramanian');
        SiteSetting::set('short_name', 'Kirtanraw');
        SiteSetting::set('tagline', 'Two decades at the bench — every piece painted, burned or carved by hand.');
        SiteSetting::set('location', 'Kuala Lumpur, Malaysia');
        SiteSetting::set('currency', 'MYR');
        SiteSetting::set('whatsapp_number', '60123456789'); // SWAP for the real number in the admin dashboard
        SiteSetting::set('social_links', [
            ['label' => 'Instagram', 'href' => 'https://www.instagram.com/kirtanrawsubramanian', 'handle' => '@kirtanrawsubramanian'],
            ['label' => 'Facebook', 'href' => 'https://www.facebook.com/kirtanraw.subramanian.1', 'handle' => 'Kirtanraw Subramanian'],
            ['label' => 'YouTube', 'href' => 'https://youtu.be/DUhSDs8wIls', 'handle' => 'Kirtanraw Subramanian'],
            ['label' => 'TikTok', 'href' => 'https://www.tiktok.com/@subramaniank24', 'handle' => '@subramaniank24'],
        ]);
        SiteSetting::set('nav_links', [
            ['label' => 'Home', 'to' => '/'],
            ['label' => 'About', 'to' => '/about'],
            ['label' => 'Artwork', 'to' => '/catalogue'],
        ]);
        SiteSetting::set('checkout_message', [
            'greeting' => "Hi {artist_name}, I'd like to order the following:",
            'signoff' => "Sent from {artist_name}'s catalogue",
        ]);
        // Copied from the hardcoded JSX in src/pages/Home.jsx — see Step 9.6.
        SiteSetting::set('home_content', [
            'heroLines' => ['EVERY PIECE', 'MADE', 'BY HAND.'],
            'heroSubtext' => 'Twenty years of painting, wood-burning and carving by {artist_name} — an independent artist in {location}. Everything here is an original, made by one pair of hands.',
            'introHeadline1' => 'EVERYONE SEES THE WORLD DIFFERENTLY.',
            'introHeadline2' => 'THIS IS HOW I SEE MINE.',
            'introBody' => "I'm Kirtanraw. Twenty years in, I'm still making the same things I always have — Hanuman and Ganesha, tigers and owls, old cars, the odd line worth remembering. Different subjects, the same slow and careful way of working.",
            'artistIntroParagraphs' => [
                "I've painted for about twenty years, and by now I work in wood just as much — burning and carving as well as brushing. Sacred figures, animals, cars, lettering: if it holds my attention, I'll make it.",
                "I was diagnosed with Asperger's. Mostly it means I can sit with one piece for hours and not notice the time. Whatever leaves the bench, I want it to be the best I can do — that matters to me more than anything. There's more on the about page.",
            ],
        ]);
    }
}
```

### Step 7.3: Artwork Seeder
```bash
php artisan make:seeder ArtworkSeeder
```
For each entry in `src/data/artworks.js`, create a matching row — copy the
fields directly (they already match 1:1), and generate image rows from
`slug` + `imageCount`:
```php
<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\ArtworkImage;
use Illuminate\Database\Seeder;

class ArtworkSeeder extends Seeder
{
    public function run()
    {
        $items = [
            // Copy each object from src/data/artworks.js here, dropping
            // `id` and the resolved `image`/`images` fields — those get
            // rebuilt from slug + imageCount below.
            [
                'slug' => 'exquisite-handcrafted-hanuman-art-by-kirtanraw',
                'title' => 'Exquisite Handcrafted Hanuman Art',
                'medium' => 'Mixed media on wood',
                'category' => 'spiritual',
                'category_label' => 'Spiritual',
                'dimensions' => 'Dimensions on request',
                'aspect' => 'portrait',
                'palette' => ['#b48648', '#5c3930'],
                'description' => 'Experience the divine presence of Hanuman with our exquisite handcrafted art piece by Kirtanraw. Transform your space with this striking portrayal of strength and devotion.',
                'features' => [
                    'Expertly handcrafted by Kirtanraw, showcasing 20 years of artistic mastery.',
                    'Features a captivating image of Hanuman with intricate details and vibrant accents.',
                    'Made with high-quality materials ensuring durability and timeless beauty.',
                ],
                'price' => 2100,
                'materials' => ['Timber panel', 'Acrylic paint', 'Wood-burning', 'Sealant'],
                'technique' => 'Wood-burning and paint combined on a timber ground',
                'tags' => ['Hanuman Art', 'Handcrafted Art', 'Spiritual Decor', 'Meditation Room Art', 'Unique Wall Art', 'Quality Craftsmanship'],
                'image_count' => 4,
                'alt' => '"Exquisite Handcrafted Hanuman Art" — mixed media on wood by Kirtanraw Subramanian',
            ],
            // ...repeat for the rest of the catalogue in src/data/artworks.js
        ];

        foreach ($items as $i => $data) {
            $imageCount = $data['image_count'];
            unset($data['image_count']);

            $artwork = Artwork::create([...$data, 'sort_order' => $i, 'available' => true]);

            for ($n = 1; $n <= $imageCount; $n++) {
                ArtworkImage::create([
                    'artwork_id' => $artwork->id,
                    'path' => "/storage/artworks/{$data['slug']}-{$n}.jpg",
                    'sort_order' => $n,
                ]);
            }
        }
    }
}
```
It's tedious to hand-copy 20+ entries, but it's copy-paste, not new content —
and it means the admin dashboard opens on day one with the *real* catalogue,
not placeholder rows.

### Step 7.4: About & How-I-See Seeders
Same pattern — copy `RAW_STEPS`/`RAW_STEADY` from `src/data/about.js` into a
`ProcessStepSeeder`/`SteadyItemSeeder`, and `howISeePieces` from
`src/data/howISee.js` into a `HowISeePieceSeeder`, resolving `artId` to the
matching `Artwork` row by `slug` lookup instead of the old numeric `id`
(numeric ids reset once artworks live in the database — match by slug or by
insertion order instead).

### Step 7.5: Run Everything
Register all seeders in `DatabaseSeeder::run()` in this order (settings and
artworks first, since about/how-i-see reference artworks by slug):
```php
$this->call([
    AdminUserSeeder::class,
    SiteSettingSeeder::class,
    ArtworkSeeder::class,
    ProcessStepSeeder::class,
    SteadyItemSeeder::class,
    HowISeePieceSeeder::class,
]);
```
```bash
php artisan migrate:fresh --seed
```

---

## Phase 8: Test API Endpoints (20 minutes)

```bash
php artisan serve

curl http://localhost:8000/api/artworks
curl http://localhost:8000/api/settings
curl http://localhost:8000/api/about

# Log in and use the token for an admin call
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kirtanraw.local","password":"change-me-immediately"}'

curl -X PUT http://localhost:8000/api/admin/settings \
  -H "Authorization: Bearer <token from above>" \
  -H "Content-Type: application/json" \
  -d '{"key":"whatsapp_number","value":"60111234567"}'

curl http://localhost:8000/api/settings   # whatsapp_number should now be updated
```

---

## Phase 9: Connect the Public React Frontend (45 minutes)

### Step 9.1: API Client
Create `frontend/src/api/client.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Step 9.2: Settings Context (replaces `src/data/site.js`)
`frontend/src/context/SettingsContext.jsx`:
```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../api/client';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiGet('/settings').then(setSettings).catch(() => setSettings({}));
  }, []);

  if (!settings) return null; // or a loading skeleton
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
```
Wrap `<App />` with `<SettingsProvider>` in `main.jsx`.

### Step 9.3: Update `whatsappOrder.js`
It currently imports the static `site` object and hardcodes the greeting/
sign-off text. Change it to accept settings as an argument, and pull the
message wording from `settings.checkout_message` (Phase 2.1) so the **entire
Cart checkout message — number, greeting, and sign-off — is editable from
admin, not just the number**:
```javascript
import { formatPrice } from './formatPrice';

const fill = (template, settings) => template.replace('{artist_name}', settings.artist_name);

export function buildOrderMessage(items, settings) {
  const { greeting, signoff } = settings.checkout_message;
  const lines = [fill(greeting, settings), ''];
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.title}`);
    lines.push(`   ${it.medium} · ${it.dimensions}`);
    lines.push(`   ${formatPrice(it.price)}`);
    lines.push('');
  });
  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  lines.push(`Order total: ${formatPrice(total)} for ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`);
  lines.push('');
  lines.push(fill(signoff, settings));
  return lines.join('\n');
}

export function buildWhatsappUrl(items, settings) {
  const number = String(settings.whatsapp_number || '').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(items, settings))}`;
}
```
Seed `checkout_message` in `SiteSettingSeeder` (Phase 7.2) with the original
copy: `{"greeting": "Hi {artist_name}, I'd like to order the following:", "signoff": "Sent from {artist_name}'s catalogue"}`.
Update `Cart.jsx` to call `const settings = useSettings()` and pass it into
both functions.

### Step 9.4: Replace Catalogue Data
`frontend/src/hooks/useArtworks.js`:
```javascript
import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export function useArtworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/artworks').then((data) => { setArtworks(data); setLoading(false); });
  }, []);

  return { artworks, loading };
}
```
Use it in `Catalogue.jsx`/`ArtworkDetails.jsx` in place of the static import
from `src/data/artworks.js`. Do the same for `/about` and `/how-i-see` in the
About and Home pages.

### Step 9.5: Frontend `.env`
```
VITE_API_URL=http://localhost:8000
```

### Step 9.6: Wire Home.jsx to `home_content` and `featured`
`Home.jsx` currently hardcodes the hero headline, subtext, intro statement,
and artist-intro paragraphs as JSX text, and picks "Featured Artwork" with
`showcase.slice(0, 6)`. Replace both with data from the API so the Home page
in the admin dashboard (Phase 10.5) actually controls what renders:
```jsx
const settings = useSettings(); // has .home_content
const { artworks } = useArtworks({ featured: true }); // GET /api/artworks?featured=1
```
Swap `HERO_FRAGMENTS`/hardcoded strings for `settings.home_content.heroLines`,
`.heroSubtext` (with `{artist_name}`/`{location}` replaced the same way as
Step 9.3), `.introHeadline1/2`, `.introBody`, and `.artistIntroParagraphs`.
`FEATURED_ARTWORKS` becomes the `artworks` array from the featured-filtered
hook call instead of a hardcoded slice. The InfiniteSpiral showcase (non-
spiritual pieces, filtered by `category` — already an editable field on every
artwork) keeps its existing filter logic rather than getting its own setting;
the "How I See" cards get their own admin screen instead (Step 10.4).

---

## Phase 10: Build the Admin Dashboard From Scratch (3-4 hours)

No Nova, no Filament — Filament is free but ties the admin UI to Blade and
Livewire, a second frontend framework on top of the React one already in this
repo. A small hand-built React admin is less total surface area for one
developer to maintain and reuses everything already known here.

### The dashboard mirrors the public site, one admin page per page the visitor sees

Instead of organizing the dashboard by database table, organize it the way
the artist thinks about the site: "the Home page," "the About page," "the
catalogue," "the Cart." Each row below is one item in the admin sidebar:

| Public page(s) | Admin page | Route | Edits |
|---|---|---|---|
| `/` Home | **Home** | `/admin/home` | Hero headline/subtext, intro statement, artist-intro paragraphs, Featured Artwork picks, "How I See" cards |
| `/about` | **About** | `/admin/about` | Process steps, "What steadies the work" cards |
| `/catalogue` + `/artwork/:id` | **Catalogue** | `/admin/catalogue` | The artwork list, add/edit/mark-sold/delete — see note below |
| `/cart` | **Cart & Checkout** | `/admin/cart` | WhatsApp number, order message greeting/sign-off |
| Header + footer on *every* page | **Site-wide** | `/admin/site` | Artist name, tagline, location, currency, social links, nav links |

Two things deliberately don't get their own sidebar item:
- **Artwork Detail (`/artwork/:id`)** isn't a separate admin page — it just
  renders one `Artwork` record in full. Editing that record from the
  Catalogue page *is* editing the detail page; a second editor for the same
  row would just be two places that can drift out of sync.
- **Site-wide** doesn't correspond to one public route because the header
  and footer render on all of them. It's grouped on its own page instead of
  bolted onto Home or About so it's obvious it's shared, not page-specific.

### Step 10.1: Admin API Client & Auth Context
`frontend/src/admin/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...authHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  localStorage.setItem('admin_token', data.token);
  return data;
}
```

`frontend/src/admin/AdminAuthContext.jsx`:
```jsx
import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [authed, setAuthed] = useState(!!localStorage.getItem('admin_token'));
  return (
    <AdminAuthContext.Provider value={{ authed, setAuthed }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
```

`frontend/src/admin/RequireAuth.jsx`:
```jsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export function RequireAuth({ children }) {
  const { authed } = useAdminAuth();
  return authed ? children : <Navigate to="/admin/login" replace />;
}
```

### Step 10.2: Routes and the Page-Mirrored Sidebar
Add to `App.jsx` (or a dedicated `AdminApp.jsx` mounted at `/admin/*`):
```jsx
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
  <Route index element={<Navigate to="home" replace />} />
  <Route path="home" element={<AdminHome />} />
  <Route path="about" element={<AdminAbout />} />
  <Route path="catalogue" element={<AdminArtworkList />} />
  <Route path="catalogue/new" element={<AdminArtworkForm />} />
  <Route path="catalogue/:id" element={<AdminArtworkForm />} />
  <Route path="cart" element={<AdminCart />} />
  <Route path="site" element={<AdminSite />} />
</Route>
```
`/admin` is not in the public `NAV_LINKS` — reach it by typing the URL
directly. That's sufficient access control for a single-owner site (real
gatekeeping is the Sanctum token, not obscurity).

`frontend/src/admin/AdminLayout.jsx` — the sidebar reads exactly like the
table above, so the mental model of "one admin page per site page" is visible
every time it's used:
```jsx
import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { adminFetch } from './api';

const PAGES = [
  { to: '/admin/home', label: 'Home' },
  { to: '/admin/about', label: 'About' },
  { to: '/admin/catalogue', label: 'Catalogue' },
  { to: '/admin/cart', label: 'Cart & Checkout' },
  { to: '/admin/site', label: 'Site-wide' },
];

export default function AdminLayout() {
  const { setAuthed } = useAdminAuth();

  const handleLogout = async () => {
    await adminFetch('/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('admin_token');
    setAuthed(false);
  };

  return (
    <div className="flex min-h-screen">
      <nav className="w-56 shrink-0 border-r border-neutral-200 p-6">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">Pages</p>
        <ul className="space-y-1">
          {PAGES.map((p) => (
            <li key={p.to}>
              <NavLink
                to={p.to}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-ink text-white' : 'text-neutral-700 hover:bg-neutral-100'}`
                }
              >
                {p.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="mt-8 text-sm text-neutral-500 hover:text-ink">
          Log out
        </button>
      </nav>
      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  );
}
```

### Step 10.3: Login Page
`frontend/src/admin/AdminLogin.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuthed } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setAuthed(true);
      navigate('/admin');
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-32 max-w-sm px-6">
      <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <label className="mt-6 block text-sm">Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2" />
      </label>
      <label className="mt-4 block text-sm">Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2" />
      </label>
      <button type="submit" className="mt-6 w-full rounded-full bg-ink py-2 text-white">Sign in</button>
    </form>
  );
}
```

### Step 10.4: The Home Page

`AdminHome.jsx` is the direct admin counterpart of `src/pages/Home.jsx`. It
edits the `home_content` setting from Phase 2.1 plus which artworks are
featured:
```jsx
const [content, setContent] = useState(null);
const [artworks, setArtworks] = useState([]);

useEffect(() => {
  adminFetch('/settings').then((s) => setContent(s.home_content));
  adminFetch('/artworks').then(setArtworks);
}, []);

const saveContent = () =>
  adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ key: 'home_content', value: content }) });

const toggleFeatured = async (artwork) => {
  const updated = await adminFetch(`/artworks/${artwork.id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ featured: !artwork.featured }),
  });
  setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
};
```
Render one text input/textarea per field of `content` (the three hero
headline lines, hero subtext, both intro headline lines, intro body, and a
repeatable list for the artist-intro paragraphs), a single "Save" button
calling `saveContent`, and below it a checklist of every artwork with a
checkbox bound to `featured` — checking a box is how the artist controls
what shows in Home's "Featured Artwork" grid, no code change needed. Put the
"How I See" cards editor on this page too (same CRUD pattern as About's
process steps, Step 10.5) since that section belongs to Home, not About.

### Step 10.5: The About Page

`AdminAbout.jsx` — list + inline-edit rows for `process_steps` and
`steady_items` (Phase 2.3), same CRUD pattern as the Catalogue page below,
referencing artworks by a `<select>` populated from `adminFetch('/artworks')`.

### Step 10.6: The Catalogue Page (List + Form)

`AdminArtworkList.jsx`: `adminFetch('/artworks')` on mount, render a table
(thumbnail, title, price, a **Sold / Available badge**, edit/delete links)
plus a prominent "New artwork" button that links to `artworks/new`.

Each row gets a one-click status button that calls the dedicated endpoint
from Phase 5 — no need to open the edit form just to mark something sold:
```jsx
async function toggleSold(artwork) {
  const updated = await adminFetch(`/artworks/${artwork.id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ available: !artwork.available }),
  });
  setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
}
```
```jsx
<button onClick={() => toggleSold(artwork)}>
  {artwork.available ? 'Mark as Sold' : 'Mark as Available'}
</button>
```
Marking a piece sold sets `available = false`, which the public API already
filters out (Phase 4's `where('available', true)`) — the piece disappears
from the live catalogue immediately, no redeploy, and stays in the database
so it can be relisted later by clicking "Mark as Available" again. Use
**Delete** only for pieces that should be permanently removed (e.g. added by
mistake); use **Mark as Sold** for anything that actually sold.

`AdminArtworkForm.jsx`: used for both **adding a brand-new artwork with its
photos** and editing an existing one. Plain HTML form fields for every column
in Phase 2.2's migration (title, medium, category, price, description,
features/materials/tags as one-per-line textareas split on `\n` before
submit, an "Available for sale (uncheck if sold)" checkbox for `available`),
plus `<input type="file" multiple accept="image/*">` for new images. On
submit, build a `FormData` (required for file uploads) and
`adminFetch('/artworks' or '/artworks/{id}', { method: 'POST', body: formData })`
— Laravel's `apiResource` update route needs `_method=PUT` appended to the
FormData when uploading files, since HTML forms can't send real PUT with
multipart bodies:
```javascript
formData.append('_method', 'PUT');
await adminFetch(`/artworks/${id}`, { method: 'POST', body: formData });
```
Show existing images with a delete (×) button calling
`adminFetch(`/artworks/${id}/images/${imageId}`, { method: 'DELETE' })`.
This full form is for adding a new piece or fixing details on an existing
one — for the common day-to-day case of "this one sold," use the quick
**Mark as Sold** button on the list above instead.

### Step 10.7: The Cart & Checkout Page

`AdminCart.jsx` is the admin counterpart of `src/pages/Cart.jsx` — everything
a customer sees between clicking "Check out on WhatsApp" and the message
landing in the artist's phone. It edits two settings keys: `whatsapp_number`
(a single text input, digits only) and `checkout_message` (two textareas,
`greeting` and `signoff`, with a hint that `{artist_name}` gets substituted).
Same save pattern as the other settings-backed pages:
```javascript
await adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ key: 'whatsapp_number', value }) });
await adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ key: 'checkout_message', value: { greeting, signoff } }) });
```
**This is the page for "the WhatsApp number changed"** — the single most
common edit this dashboard exists for. Show a live preview of the built
message (reuse `buildOrderMessage` from `whatsappOrder.js` with one dummy
line item) so the artist can see exactly what a customer's message will look
like before saving.

### Step 10.8: The Site-wide Page

`AdminSite.jsx` covers everything that renders on *every* public page via
the header/footer, not just one: `artist_name`, `tagline`, `location`,
`currency`, and repeatable-row editors for `social_links` (label + href +
handle) and `nav_links` (label + path) — add row / remove row / edit
in place. Same `PUT /api/admin/settings` save pattern as Step 10.7.

Put the **change password** form here too (Step 10.9) — it's account
settings, not content tied to any one public page.

### Step 10.9: Change Password
Add a small form on the Site-wide page that calls `PUT /api/admin/password`
from Phase 3.2. Use it immediately after first login to replace the seeded
`change-me-immediately` password.

---

## Phase 11: Run Full Stack Locally (15 minutes)

```bash
# Terminal 1
cd backend && php artisan serve        # http://localhost:8000

# Terminal 2
cd frontend && npm run dev             # http://localhost:5173
```

Checklist:
1. `http://localhost:5173` shows real artworks from the database.
2. `http://localhost:5173/admin/login` → sign in with the seeded admin user.
3. Edit the WhatsApp number in Admin → Cart & Checkout, save.
4. Add an item to the cart on the public site and check out — the WhatsApp
   link opens with the **new** number, with no redeploy.
5. Browser console (F12) — no errors, network tab shows calls to
   `localhost:8000/api/...`.

---

## Phase 12: Deployment (When Ready)

### Step 12.1: Prepare for Production
```bash
cd backend
php artisan key:generate --force
composer install --optimize-autoloader --no-dev
# .env: APP_ENV=production, APP_DEBUG=false
```

### Step 12.2: Uploaded Images Need a Persistent Disk
Because there's no budget for S3, artwork images live on the server's own
filesystem (`storage/app/public`). This is fine **as long as the host you
pick doesn't wipe the filesystem on every deploy** — Heroku's dynos do
exactly that, so avoid it for this project, or mount a persistent volume if
your host supports one. A basic DigitalOcean/Linode VPS or App Platform with
a persistent volume works with zero code changes. Whatever you choose, make
sure `php artisan storage:link` runs once on the server and back up
`storage/app/public` the same way you'd back up the database.

### Step 12.3: Deploy
- **Backend:** any VPS or PaaS with persistent disk + MySQL (DigitalOcean,
  Railway, Render). Set the same `.env` values as local, pointing at the
  production database.
- **Frontend:** Vercel or Netlify. Set `VITE_API_URL` to the deployed backend
  URL.
- Update `backend/config/cors.php` → `allowed_origins` and `FRONTEND_URL` in
  `.env` to the real frontend domain.

---

## Common Issues & Fixes

### "CORS error: blocked by browser"
Check `config/cors.php` — `allowed_origins` must exactly match the frontend's
origin (protocol + host + port), and `paths` must include `storage/*` for
uploaded images to load cross-origin in dev.

### "401 Unauthorized on every admin call"
- Token missing/expired: log in again, confirm `localStorage.admin_token` is set.
- `Authorization: Bearer <token>` header missing — check `adminFetch` is used
  instead of a raw `fetch` for admin routes.

### "Uploaded image 404s"
```bash
php artisan storage:link   # re-run if the symlink is missing after a fresh clone
```

### "Database connection failed"
```bash
mysql -u gallery_user -p kirtanraw_gallery
cat .env | grep DB_
php artisan migrate
```

### "API returns 404"
```bash
php artisan route:list --path=api
```

---

## Summary Checklist

- [ ] MySQL database created
- [ ] Laravel project created in `backend/`, Sanctum installed (`install:api`)
- [ ] Models/migrations: `SiteSetting`, `Artwork`, `ArtworkImage`, `ProcessStep`, `SteadyItem`, `HowISeePiece`
- [ ] Admin user seeded, password changed from the default
- [ ] Public API: artworks, settings, about, how-i-see — no auth
- [ ] Admin API: full CRUD on artworks (+ image upload), settings, about — behind `auth:sanctum`
- [ ] Real catalogue imported from `src/data/*.js` (not placeholder rows)
- [ ] React frontend reads artworks/settings/about from the API, not static files
- [ ] `whatsappOrder.js` uses the live `whatsapp_number` setting, not a hardcoded value
- [ ] Admin dashboard built with one page per public page: Home, About, Catalogue, Cart & Checkout, Site-wide, plus login and change-password
- [ ] Admin can add a new artwork with photos, and mark a sold piece off the catalogue with one click (without deleting its record)
- [ ] Admin can pick which artworks show in Home's Featured Artwork grid and edit the Home page's headline/intro copy
- [ ] Changing the WhatsApp number or checkout message on the Cart & Checkout page changes the live checkout link/message with no deploy
- [ ] Both frontend and backend running locally, no console errors
- [ ] Deployment plan accounts for persistent image storage (no S3, no ephemeral filesystem)

---

**Total time: ~7-9 hours for a developer new to Laravel. Follow in order!** 🚀
