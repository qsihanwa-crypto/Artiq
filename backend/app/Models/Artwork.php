<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Artwork extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'medium', 'category', 'category_label', 'dimensions',
        'aspect', 'palette', 'description', 'features', 'price', 'available',
        'materials', 'technique', 'tags', 'alt', 'featured', 'sort_order',
    ];

    protected $casts = [
        'palette' => 'array',
        'features' => 'array',
        'materials' => 'array',
        'tags' => 'array',
        'available' => 'boolean',
        'featured' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ArtworkImage::class)->orderBy('sort_order');
    }
}
