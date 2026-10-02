<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SteadyItem extends Model
{
    //
    protected $fillable = [
        'title', 'body', 'insight', 'artwork_id', 'swatch_artwork_ids', 'sort_order',
    ];

    protected $casts = [
        'swatch_artwork_ids' => 'array',
    ];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
