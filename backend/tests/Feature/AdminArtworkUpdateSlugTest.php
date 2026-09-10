<?php

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminArtworkUpdateSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_generates_unique_slug_when_blank(): void
    {
        $user = User::factory()->create();

        $artwork = Artwork::create([
            'slug' => 'existing-artwork',
            'title' => 'Existing Artwork',
            'medium' => 'Acrylic',
            'category' => 'Animals',
            'category_label' => 'Animals',
            'dimensions' => '24 x 36',
            'aspect' => 'portrait',
            'description' => 'A test artwork',
            'price' => 500.00,
            'available' => true,
            'alt' => 'A test artwork',
            'featured' => false,
            'sort_order' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/admin/artworks/' . $artwork->id, [
            'title' => 'Updated Artwork',
            'slug' => '',
            'medium' => 'Oil',
            'category' => 'Animals',
            'category_label' => 'Animals',
            'dimensions' => '30 x 40',
            'aspect' => 'portrait',
            'description' => 'Updated description',
            'price' => 600.00,
            'available' => true,
            'alt' => 'Updated artwork',
            'featured' => false,
            'sort_order' => 2,
        ]);

        $response->assertOk();
        $this->assertSame('updated-artwork', $response->json('slug'));
        $this->assertDatabaseHas('artworks', ['id' => $artwork->id, 'slug' => 'updated-artwork']);
    }
}
