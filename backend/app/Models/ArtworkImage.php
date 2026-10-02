<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtworkImage extends Model
{
    protected $fillable = ['artwork_id', 'path', 'sort_order'];

    public function getPathAttribute($value): ?string
    {
        if (!$value || !str_starts_with($value, '/storage/artworks/')) {
            return $value;
        }

        $baseUrl = rtrim((string) env('SUPABASE_URL'), '/');
        $bucket = trim((string) env('SUPABASE_STORAGE_BUCKET', 'artwork'), '/');

        if (!$baseUrl) {
            return $value;
        }

        $filename = ltrim(substr($value, strlen('/storage/artworks/')), '/');
        return $baseUrl . '/storage/v1/object/public/' . $bucket . '/' . $filename;
    }

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
