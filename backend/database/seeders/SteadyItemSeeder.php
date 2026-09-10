<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\SteadyItem;
use Illuminate\Database\Seeder;

class SteadyItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'title' => 'Routine',
                'body' => 'Same corner, same tools in the same places, every working day.',
                'insight' => "I lay everything out the same way — pens on one side, paint on the other. Once my hands know where things are without looking, the room disappears and it's just me and the piece.",
                'artId' => '48',
                'sort_order' => 1,
            ],
            [
                'title' => 'Focus',
                'body' => 'Long stretches on one piece, following a single thread until it resolves.',
                'insight' => "On a good day I look up and it's dark out. I've moved one shape three millimetres and I'm pleased about it. That's the feeling I keep coming back for.",
                'artId' => '51',
                'sort_order' => 2,
            ],
            [
                'title' => 'Colour',
                'body' => "The colours usually turn up before the drawing's even finished.",
                'insight' => 'I nearly always know the palette first. Subject, size, finish — those come after. The colour is the feeling; the rest is me building something for it to live in.',
                'swatchArtIds' => ['51', '54', '60', '52', '70'],
                'sort_order' => 3,
            ],
        ];

        foreach ($items as $item) {
            $payload = [
                'title' => $item['title'],
                'body' => $item['body'],
                'insight' => $item['insight'],
                'sort_order' => $item['sort_order'],
            ];

            if (isset($item['artId'])) {
                $payload['artwork_id'] = Artwork::where('id', $item['artId'])->firstOrFail()->id;
            }

            if (isset($item['swatchArtIds'])) {
                $payload['swatch_artwork_ids'] = array_map(function ($id) {
                    return Artwork::where('id', $id)->firstOrFail()->id;
                }, $item['swatchArtIds']);
            }

            SteadyItem::create($payload);
        }
    }
}