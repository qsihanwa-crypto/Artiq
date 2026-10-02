<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProcessStep;
use App\Models\SteadyItem;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function processIndex()
    {
        return ProcessStep::with('artwork.images')->orderBy('sort_order')->get();
    }

    public function processStore(Request $request)
    {
        return response()->json(ProcessStep::create($this->processData($request)), 201);
    }

    public function processUpdate(Request $request, $id)
    {
        $step = ProcessStep::findOrFail($id);
        $step->update($this->processData($request));
        return response()->json($step->load('artwork.images'));
    }

    public function processDestroy($id)
    {
        ProcessStep::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function steadyIndex()
    {
        return SteadyItem::with('artwork.images')->orderBy('sort_order')->get();
    }

    public function steadyStore(Request $request)
    {
        return response()->json(SteadyItem::create($this->steadyData($request)), 201);
    }

    public function steadyUpdate(Request $request, $id)
    {
        $item = SteadyItem::findOrFail($id);
        $item->update($this->steadyData($request));
        return response()->json($item->load('artwork.images'));
    }

    public function steadyDestroy($id)
    {
        SteadyItem::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    private function processData(Request $request): array
    {
        return $request->validate([
            'label' => 'required|string|max:255',
            'text' => 'required|string',
            'artwork_id' => 'nullable|exists:artworks,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);
    }

    private function steadyData(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'insight' => 'required|string',
            'artwork_id' => 'nullable|exists:artworks,id',
            'swatch_artwork_ids' => 'nullable|array',
            'swatch_artwork_ids.*' => 'integer|exists:artworks,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);
    }
}
