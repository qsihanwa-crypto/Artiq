<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\ArtworkImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ArtworkController extends Controller
{
    public function index()
    {
        return Artwork::with('images')->orderBy('sort_order')->get();
    }

    public function show($id)
    {
        return response()->json(Artwork::with('images')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $this->withDefaults($this->validated($request), true);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title']);
        $artwork = Artwork::create($validated);
        $this->attachUploadedImages($request, $artwork);
        return response()->json($artwork->load('images'), 201);
    }

    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $validated = $this->withDefaults($this->validated($request, $id), false);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title'], $id);
        $artwork->update($validated);
        $this->attachUploadedImages($request, $artwork);
        return response()->json($artwork->load('images'));
    }

    public function destroy($id)
    {
        Artwork::findOrFail($id)->delete(); // soft delete
        return response()->json(null, 204);
    }

    public function restore($id)
    {
        $restored = DB::table('artworks')->where('id', $id)->update(['deleted_at' => null]);
        abort_unless($restored, 404);
        return response()->json(['id' => (int) $id, 'restored' => true]);
    }

    // PATCH /api/admin/artworks/{id}/availability — one-click "Mark Sold" /
    // "Mark Available" from the list view. Separate from update() so the
    // artist can flip this from a list row without opening the full edit
    // form and re-sending every field.
    public function toggleAvailability(Request $request, $id)
    {
        $data = $request->validate(['available' => 'required|boolean']);
        $data['status'] = $data['available'] ? 'for_sale' : 'sold';
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
        Storage::disk('public')->delete(str_replace('/storage/', '', $image->getRawOriginal('path')));
        $image->delete();
        return response()->json(null, 204);
    }

    private function validated(Request $request, $id = null): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'medium' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'category_label' => 'nullable|string|max:100',
            'dimensions' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1000|max:2100',
            'aspect' => 'nullable|in:portrait,landscape,square',
            'palette' => 'nullable|array',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'price' => 'nullable|numeric|min:0',
            'available' => 'boolean',
            'status' => 'required|in:for_sale,exhibition,sold',
            'materials' => 'nullable|array',
            'technique' => 'nullable|string',
            'tags' => 'nullable|array',
            'alt' => 'nullable|string|max:255',
            'featured' => 'boolean',
            'sort_order' => 'nullable|integer',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:10240',
            'image_data' => 'nullable|array',
            'image_data.*' => 'string|max:15000000',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'required|url|max:2048',
            'image_url' => 'nullable|url|max:2048',
        ]);
    }

    // Columns that are NOT NULL in the schema but optional in the form.
    private function withDefaults(array $validated, bool $creating): array
    {
        $defaults = [
            'category' => 'other',
            'category_label' => 'Other',
            'aspect' => 'landscape',
            'description' => '',
            'price' => 0,
            'alt' => $validated['title'] ?? '',
        ];

        foreach ($defaults as $key => $default) {
            if (($validated[$key] ?? null) !== null && $validated[$key] !== '') {
                continue;
            }
            if ($creating) {
                $validated[$key] = $default;
            } else {
                unset($validated[$key]);
            }
        }

        return $validated;
    }

    private function uniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $slug = Str::slug($base) ?: 'artwork';
        $candidate = $slug;
        $counter = 2;

        while (Artwork::where('slug', $candidate)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $candidate = $slug . '-' . $counter;
            $counter++;
        }

        return $candidate;
    }

    private function attachUploadedImages(Request $request, Artwork $artwork): void
    {
        $nextOrder = $artwork->images()->max('sort_order') + 1;
        foreach ($request->file('images', []) as $file) {
            $path = 'artworks/' . Str::uuid() . '.' . $file->extension();
            $publicUrl = $this->storePublicImage($path, $file->get(), $file->getMimeType());
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => $publicUrl,
                'sort_order' => $nextOrder++,
            ]);
        }

        foreach ($request->input('image_data', []) as $dataUrl) {
            if (!preg_match('/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/', $dataUrl, $matches)) {
                continue;
            }

            $contents = base64_decode($matches[2], true);
            if ($contents === false || @getimagesizefromstring($contents) === false) {
                continue;
            }

            $extension = $matches[1] === 'image/jpeg' ? 'jpg' : substr($matches[1], 6);
            $path = 'artworks/' . Str::uuid() . '.' . $extension;
            $publicUrl = $this->storePublicImage($path, $contents, $matches[1]);
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => $publicUrl,
                'sort_order' => $nextOrder++,
            ]);
        }

        foreach ($request->input('image_urls', []) as $url) {
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => $url,
                'sort_order' => $nextOrder++,
            ]);
        }

        if ($request->filled('image_url')) {
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => $request->input('image_url'),
                'sort_order' => $nextOrder++,
            ]);
        }
    }
    private function storePublicImage(string $path, string $contents, string $mime): string
    {
        $baseUrl = rtrim((string) env('SUPABASE_URL'), '/');
        $bucket = trim((string) env('SUPABASE_STORAGE_BUCKET', 'artwork'), '/');
        $serviceRoleKey = (string) env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$baseUrl || !$serviceRoleKey) {
            throw ValidationException::withMessages([
                'image_data' => 'Image storage is not configured. Please contact the site administrator.',
            ]);
        }

        $response = Http::withHeaders([
            'apikey' => $serviceRoleKey,
            'Authorization' => 'Bearer ' . $serviceRoleKey,
            'x-upsert' => 'false',
        ])->withBody($contents, $mime)->post("{$baseUrl}/storage/v1/object/{$bucket}/{$path}");

        if ($response->failed()) {
            $message = $response->json('message') ?: 'The storage service rejected the upload.';
            throw ValidationException::withMessages([
                'image_data' => "Image upload failed ({$response->status()}): {$message}",
            ]);
        }

        return "{$baseUrl}/storage/v1/object/public/{$bucket}/{$path}";
    }
}
