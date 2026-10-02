<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;

class PublicSettingController extends Controller
{
    // GET /api/settings — everything the frontend needs: name, tagline,
    // socials, nav links, and yes, the WhatsApp number.
    public function index()
    {
        return response()->json(SiteSetting::allAsArray());
    }
}