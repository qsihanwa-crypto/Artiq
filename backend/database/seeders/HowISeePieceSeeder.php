<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\HowISeePiece;
use Illuminate\Database\Seeder;

class HowISeePieceSeeder extends Seeder
{
    public function run(): void
    {
        $pieces = [
            [
                'id' => '69',
                'focal_x' => 50,
                'focal_y' => 38,
                'focal_scale' => 3,
                'insight' => "Eyes and face first. Get those wrong and it's just feathers — so I don't touch anything else until it's looking back at me.",
                'sort_order' => 1,
            ],
            [
                'id' => '51',
                'focal_x' => 52,
                'focal_y' => 40,
                'focal_scale' => 3.2,
                'insight' => 'The eyes, then the stripes outward from there. The stripes are what turn paint into an animal.',
                'sort_order' => 2,
            ],
            [
                'id' => '31',
                'focal_x' => 48,
                'focal_y' => 52,
                'focal_scale' => 2.7,
                'insight' => "You can't lift a burned line, so with pyrography I go lightest first and darken in passes. Patience is most of the skill.",
                'sort_order' => 3,
            ],
            [
                'id' => '32',
                'focal_x' => 50,
                'focal_y' => 44,
                'focal_scale' => 2.8,
                'insight' => "Carving is taking away. The dog is already in the panel — my job is removing everything that isn't the dog.",
                'sort_order' => 4,
            ],
            [
                'id' => '54',
                'focal_x' => 46,
                'focal_y' => 50,
                'focal_scale' => 3.1,
                'insight' => 'No subject on this one, just colour. I let the knife lead and made myself stop before I tidied the life out of it.',
                'sort_order' => 5,
            ],
        ];

        foreach ($pieces as $piece) {
            $artwork = Artwork::where('id', $piece['id'])->firstOrFail();

            HowISeePiece::create([
                'artwork_id' => $artwork->id,
                'focal_x' => $piece['focal_x'],
                'focal_y' => $piece['focal_y'],
                'focal_scale' => $piece['focal_scale'],
                'insight' => $piece['insight'],
                'sort_order' => $piece['sort_order'],
            ]);
        }
    }
}