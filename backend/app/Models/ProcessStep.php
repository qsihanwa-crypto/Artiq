<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessStep extends Model
{
    //
    protected $fillable = ['label', 'text', 'artwork_id', 'sort_order'];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
