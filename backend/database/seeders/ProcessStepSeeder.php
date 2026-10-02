<?php

namespace Database\Seeders;

use App\Models\Artwork;
use App\Models\ProcessStep;
use Illuminate\Database\Seeder;

class ProcessStepSeeder extends Seeder
{
    public function run(): void
    {
        $steps = [
            ['label' => 'Idea', 'text' => "Usually it's a subject I keep coming back to in my head — a figure, an animal, a car — until I have to start.", 'artId' => '70', 'sort_order' => 1],
            ['label' => 'Drawing', 'text' => "I draw the whole thing out full size first. If the drawing's wrong, no amount of colour later will save it.", 'artId' => '49', 'sort_order' => 2],
            ['label' => 'Blocking in', 'text' => 'On wood I burn the outlines and shadows in first. On canvas the darkest darks go down early and I work toward the light.', 'artId' => '43', 'sort_order' => 3],
            ['label' => 'Colour', 'text' => "Then colour, layer over layer, slowly. Hours go here — this is the part I'd happily do all day.", 'artId' => '57', 'sort_order' => 4],
            ['label' => 'Finished work', 'text' => "Sealing, and a long last look for anything not right. It doesn't leave the bench until I'd hang it myself.", 'artId' => '54', 'sort_order' => 5],
        ];

        foreach ($steps as $step) {
            $artwork = Artwork::where('id', $step['artId'])->firstOrFail();

            ProcessStep::create([
                'label' => $step['label'],
                'text' => $step['text'],
                'artwork_id' => $artwork->id,
                'sort_order' => $step['sort_order'],
            ]);
        }
    }
}