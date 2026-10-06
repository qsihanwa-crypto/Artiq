<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\ArtworkImage;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class FinalizedArtworkSeeder extends Seeder
{
    public function run(): void
    {
        if (SiteSetting::get('finalized_artworks_imported', false)) {
            return;
        }

        $manifestPath = database_path('seeders/finalized-artworks.json');
        $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
        if (!$manifest) {
            throw new \RuntimeException('The finalized artwork manifest is empty.');
        }

        $baseUrl = rtrim((string) env('SUPABASE_URL'), '/');
        $bucket = trim((string) env('SUPABASE_STORAGE_BUCKET', 'artwork'), '/');
        $serviceRoleKey = (string) env('SUPABASE_SERVICE_ROLE_KEY');
        if (!$baseUrl || !$serviceRoleKey) {
            throw new \RuntimeException('Artiq Supabase storage is not configured.');
        }

        foreach ($manifest as $item) {
            $medium = trim((string) ($item['medium'] ?? ''));
            if ($medium === '') {
                $medium = 'Acrylic on Canvas';
            }

            $imageUrl = null;
            if (!empty($item['image_file'])) {
                $imagePath = database_path('seeders/finalized-images/' . basename($item['image_file']));
                $contents = file_get_contents($imagePath);
                if ($contents === false) {
                    throw new \RuntimeException('Missing finalized artwork image: ' . $item['image_file']);
                }

                $extension = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));
                $mime = $extension === 'webp' ? 'image/webp' : 'image/jpeg';
                $objectPath = 'finalized/' . $item['slug'] . '.' . $extension;
                Http::withHeaders([
                    'apikey' => $serviceRoleKey,
                    'Authorization' => 'Bearer ' . $serviceRoleKey,
                    'x-upsert' => 'true',
                ])->withBody($contents, $mime)
                    ->post("{$baseUrl}/storage/v1/object/{$bucket}/{$objectPath}")
                    ->throw();

                $imageUrl = "{$baseUrl}/storage/v1/object/public/{$bucket}/{$objectPath}";
            }

            $artwork = Artwork::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'title' => $item['title'],
                    'medium' => $medium,
                    'category' => $item['category'],
                    'category_label' => $item['category_label'],
                    'dimensions' => $item['dimensions'],
                    'year' => $item['year'],
                    'aspect' => 'landscape',
                    'description' => $item['description'] ?: $item['title'],
                    'price' => $item['price'],
                    'available' => $item['available'],
                    'status' => $item['status'],
                    'materials' => [],
                    'technique' => null,
                    'tags' => ['Finalized 2025 catalog', $item['category_label']],
                    'alt' => $item['alt'],
                    'featured' => $item['featured'],
                    'sort_order' => $item['sort_order'],
                ]
            );

            if ($imageUrl) {
                ArtworkImage::updateOrCreate(
                    ['artwork_id' => $artwork->id, 'sort_order' => 1],
                    ['path' => $imageUrl]
                );
            }
        }

        SiteSetting::set('currency', 'RM');
        SiteSetting::set('finalized_artworks_imported', true);
    }
}