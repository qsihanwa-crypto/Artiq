<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use Illuminate\Http\Request;

class PublicArtworkController extends Controller
{
    // GET /api/artworks               — full catalogue
    // GET /api/artworks?featured=1    — just the Home page's featured picks
    public function index(Request $request)
    {
        $query = Artwork::with('images')->where('available', true);
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }
        return $query->orderBy('sort_order')->get();
    }

    // GET /api/artworks/{slug}
    public function show($slug)
    {
        $artwork = Artwork::with('images')->where('slug', $slug)->firstOrFail();
        return response()->json($artwork);
    }
}