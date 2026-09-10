<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcessStep;
use App\Models\SteadyItem;
use App\Models\HowISeePiece;

class PublicAboutController extends Controller
{
    // GET /api/about
    public function index()
    {
        return response()->json([
            'processSteps' => ProcessStep::with('artwork.images')->orderBy('sort_order')->get(),
            'steadyItems'  => SteadyItem::with('artwork.images')->orderBy('sort_order')->get(),
        ]);
    }

    // GET /api/how-i-see
    public function howISee()
    {
        return response()->json(
            HowISeePiece::with('artwork.images')->orderBy('sort_order')->get()
        );
    }
}
