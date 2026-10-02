<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // GET /api/admin/settings — same shape as the public one, for the form
    public function index()
    {
        return response()->json(SiteSetting::allAsArray());
    }

    // PUT /api/admin/settings — body: { "key": "whatsapp_number", "value": "60123456789" }
    public function update(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string|max:100',
            'value' => 'required',
        ]);

        SiteSetting::set($data['key'], $data['value']);
        return response()->json(['key' => $data['key'], 'value' => $data['value']]);
    }
}