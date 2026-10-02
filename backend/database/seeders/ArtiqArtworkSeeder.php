<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\ArtworkImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class ArtiqArtworkSeeder extends Seeder
{
    private const ARTWORKS = [
        ['slug' => 'fancy-garden', 'title' => 'Fancy Garden', 'category' => 'gardens', 'label' => 'Gardens', 'description' => 'Drifts of pink and violet blossom line a garden path beneath the hanging curtain of a willow.', 'image' => 'fancy-garden-1.webp'],
        ['slug' => 'penang-old-town', 'title' => 'Penang Old Town', 'category' => 'places', 'label' => 'Places', 'description' => 'A corner of old Penang: green-shuttered shophouses, a rojak stall under striped umbrellas, and a trishaw waiting at the kerb.', 'image' => 'penang-old-town-1.webp'],
        ['slug' => 'a-view-of-cheringin-hill', 'title' => 'A view of Cheringin Hill', 'category' => 'landscapes', 'label' => 'Landscapes', 'description' => 'Red-roofed houses tucked into green hillside, with mist rolling over the valley beyond.', 'image' => 'a-view-of-cheringin-hill-1.webp'],
        ['slug' => 'yellow-irises-by-the-stream', 'title' => 'Yellow Irises by the Stream', 'category' => 'gardens', 'label' => 'Gardens', 'description' => 'Yellow irises crowd the bank of a blue stream, with an arched wooden footbridge crossing behind them.', 'image' => 'yellow-irises-by-the-stream-1.webp'],
        ['slug' => 'apples-for-tea', 'title' => 'Apples For Tea?', 'category' => 'still-life', 'label' => 'Still life', 'description' => 'A still life of green apples, an old copper kettle and a glass of tea, set among folds of blue and orange cloth.', 'image' => 'apples-for-tea-1.jpg'],
        ['slug' => 'a-beautiful-garden-in-pointillism-style', 'title' => 'A beautiful garden in Pointillism style', 'medium' => 'Painting, pointillism', 'category' => 'gardens', 'label' => 'Gardens', 'description' => 'Winding bands of orange, pink, blue and white flowers, built up dot by dot, loop between green pools.', 'image' => 'a-beautiful-garden-in-pointillism-style-1.jpg'],
        ['slug' => 'light-of-hope', 'title' => 'Light of Hope', 'category' => 'landscapes', 'label' => 'Landscapes', 'description' => 'Sunlight breaks through violet storm clouds onto golden hills, an arched stone bridge and a quiet lake.', 'image' => 'light-of-hope-1.jpg'],
        ['slug' => 'lake-wanaka-at-sunrise', 'title' => 'Lake Wanaka at Sunrise', 'category' => 'landscapes', 'label' => 'Landscapes', 'description' => 'A lone tree stands in the still water of Lake Wanaka as the sun rises over the mountains.', 'image' => 'lake-wanaka-at-sunrise-1.jpg'],
    ];

    public function run(): void
    {
        $baseUrl = rtrim((string) env('SUPABASE_URL'), '/');
        $bucket = trim((string) env('SUPABASE_STORAGE_BUCKET', 'artwork'), '/');
        $serviceRoleKey = (string) env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$baseUrl || !$serviceRoleKey) {
            throw new \RuntimeException('Set the Artiq Supabase URL and service-role key before seeding artwork.');
        }

        foreach (self::ARTWORKS as $index => $item) {
            $imagePath = database_path('seeders/artwork-images/' . $item['image']);
            $contents = file_get_contents($imagePath);
            if ($contents === false) {
                throw new \RuntimeException("Missing Artiq artwork seed image: {$item['image']}");
            }

            $mime = str_ends_with($item['image'], '.webp') ? 'image/webp' : 'image/jpeg';
            $objectPath = 'artworks/' . $item['slug'] . '.' . pathinfo($item['image'], PATHINFO_EXTENSION);

            Http::withHeaders([
                'apikey' => $serviceRoleKey,
                'Authorization' => 'Bearer ' . $serviceRoleKey,
                'x-upsert' => 'true',
            ])->withBody($contents, $mime)
                ->post("{$baseUrl}/storage/v1/object/{$bucket}/{$objectPath}")
                ->throw();

            $artwork = Artwork::firstOrCreate(
                ['slug' => $item['slug']],
                [
                    'title' => $item['title'],
                    'medium' => $item['medium'] ?? 'Painting',
                    'category' => $item['category'],
                    'category_label' => $item['label'],
                    'dimensions' => 'Dimensions on request',
                    'aspect' => 'landscape',
                    'description' => $item['description'],
                    'price' => 0,
                    'available' => true,
                    'status' => 'exhibition',
                    'materials' => ['Canvas'],
                    'technique' => 'Original exhibition painting',
                    'tags' => ['Artiq', $item['label']],
                    'alt' => '"' . $item['title'] . '" by Dennis Liew. ' . $item['description'],
                    'featured' => $index < 4,
                    'sort_order' => $index + 1,
                ]
            );

            ArtworkImage::updateOrCreate(
                ['artwork_id' => $artwork->id, 'path' => "{$baseUrl}/storage/v1/object/public/{$bucket}/{$objectPath}"],
                ['sort_order' => 1]
            );
        }
    }
}