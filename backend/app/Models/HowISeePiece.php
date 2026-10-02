<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HowISeePiece extends Model
{
    //
    protected $fillable = [
        'artwork_id', 'focal_x', 'focal_y', 'focal_scale', 'insight', 'sort_order',
    ];

    protected $casts = [
        'focal_x' => 'decimal:2',
        'focal_y' => 'decimal:2',
        'focal_scale' => 'decimal:2',
    ];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
