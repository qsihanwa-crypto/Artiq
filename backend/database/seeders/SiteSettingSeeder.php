<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'artist_name' => 'Dennis Liew',
            'short_name' => 'Dennis',
            'tagline' => 'Sharing my journey as an artist.',
            'location' => 'Malaysia',
            'currency' => 'MYR',
            'social_links' => [
                ['label' => 'YouTube', 'href' => 'https://www.youtube.com/channel/UCY226m6JyIjBozmKHeYw-dA/featured'],
                ['label' => 'Facebook', 'href' => 'https://www.facebook.com/groups/2070292319937008'],
            ],
            'nav_links' => [
                ['label' => 'Home', 'to' => '/'],
                ['label' => 'About', 'to' => '/about'],
                ['label' => 'Artwork', 'to' => '/catalogue'],
            ],
            'home_content' => [
                'heroLines' => ['LANDSCAPES', 'THAT HOLD', 'HOPE.'],
                'heroSubtext' => 'Landscapes, gardens and nature, painted by {artist_name}, an artist based in {location}.',
                'introHeadline1' => 'EVERYONE SEES THE WORLD DIFFERENTLY.',
                'introHeadline2' => 'THIS IS HOW I SEE MINE.',
                'introBody' => 'Hi, I am Dennis. I would like to share my journey as an artist with you.',
                'artistIntroParagraphs' => [
                    'I am Dennis Liew, an artist based in Malaysia. I have held various exhibitions in Malaysia, held live-art painting demonstrations, and taught art classes organised by Gamuda Land.',
                    'My mother, Patricia, is my pillar of strength and encouragement. It is because of her that I am able to continue my passion in painting.',
                ],
            ],
        ];

        foreach ($settings as $key => $value) {
            if (!SiteSetting::where('key', $key)->exists()) {
                SiteSetting::set($key, $value);
            }
        }
    }
}
