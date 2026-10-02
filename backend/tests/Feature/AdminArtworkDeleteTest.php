<?php

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminArtworkDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_removes_artwork_from_admin_index_and_soft_deletes_it(): void
    {
        $user = User::factory()->create();

        $artwork = Artwork::create([
            'slug' => 'test-artwork',
            'title' => 'Test Artwork',
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

        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson('/api/admin/artworks/' . $artwork->id);
        $deleteResponse->assertStatus(204);

        $this->assertNotNull(Artwork::withTrashed()->find($artwork->id)->deleted_at);
        $this->assertNull(Artwork::find($artwork->id));

        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/admin/artworks');
        $listResponse->assertOk()->assertJsonMissing(['id' => $artwork->id]);
    }
}
