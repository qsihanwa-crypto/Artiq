<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::set('artist_name', 'Kirtanraw Subramanian');
        SiteSetting::set('short_name', 'Kirtanraw');
        SiteSetting::set('tagline', 'Two decades at the bench — every piece painted, burned or carved by hand.');
        SiteSetting::set('location', 'Kuala Lumpur, Malaysia');
        SiteSetting::set('currency', 'MYR');
        SiteSetting::set('whatsapp_number', '60123456789');

        SiteSetting::set('social_links', [
            [
                'label' => 'Instagram',
                'href' => 'https://www.instagram.com/kirtanrawsubramanian',
                'handle' => '@kirtanrawsubramanian',
            ],
            [
                'label' => 'Facebook',
                'href' => 'https://www.facebook.com/kirtanraw.subramanian.1',
                'handle' => 'Kirtanraw Subramanian',
            ],
            [
                'label' => 'YouTube',
                'href' => 'https://youtu.be/DUhSDs8wIls',
                'handle' => 'Kirtanraw Subramanian',
            ],
            [
                'label' => 'TikTok',
                'href' => 'https://www.tiktok.com/@subramaniank24',
                'handle' => '@subramaniank24',
            ],
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
