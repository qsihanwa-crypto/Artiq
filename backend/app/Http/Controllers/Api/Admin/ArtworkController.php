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
        return Artwork::with('images')->orderBy('sort_order')->get();
    }

    public function show($id)
    {
        return response()->json(Artwork::with('images')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title']);
        $artwork = Artwork::create($validated);
        $this->attachUploadedImages($request, $artwork);
        return response()->json($artwork->load('images'), 201);
    }

    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $validated = $this->validated($request, $id);
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
            'slug' => 'nullable|string|max:255',
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:10240',
            'image_data' => 'nullable|array',
            'image_data.*' => 'string|max:15000000',
        ]);
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
            $path = $file->store('artworks', 'public');
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => '/storage/' . $path,
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
            Storage::disk('public')->put($path, $contents);
            ArtworkImage::create([
                'artwork_id' => $artwork->id,
                'path' => '/storage/' . $path,
                'sort_order' => $nextOrder++,
            ]);
        }
    }
}