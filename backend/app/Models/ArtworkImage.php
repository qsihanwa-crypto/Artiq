<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtworkImage extends Model
{
    //
    protected $fillable = ['artwork_id', 'path', 'sort_order'];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
