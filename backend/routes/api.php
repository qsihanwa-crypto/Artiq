<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicArtworkController;
use App\Http\Controllers\Api\PublicSettingController;
use App\Http\Controllers\Api\PublicAboutController;
use App\Http\Controllers\Api\Admin\ArtworkController as AdminArtworkController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\AboutController as AdminAboutController;

// --- Public (read-only, no auth) ---
Route::get('/artworks', [PublicArtworkController::class, 'index']);
Route::get('/artworks/{slug}', [PublicArtworkController::class, 'show']);
Route::get('/settings', [PublicSettingController::class, 'index']);
Route::get('/about', [PublicAboutController::class, 'index']);
Route::get('/how-i-see', [PublicAboutController::class, 'howISee']);

// --- Admin auth ---
Route::post('/admin/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    Route::apiResource('artworks', AdminArtworkController::class);
    Route::patch('/artworks/{id}/availability', [AdminArtworkController::class, 'toggleAvailability']);
    Route::patch('/artworks/{id}/featured', [AdminArtworkController::class, 'toggleFeatured']);
    Route::delete('/artworks/{artwork}/images/{image}', [AdminArtworkController::class, 'deleteImage']);

    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::put('/settings', [AdminSettingController::class, 'update']);

    Route::get('/process-steps', [AdminAboutController::class, 'processIndex']);
    Route::post('/process-steps', [AdminAboutController::class, 'processStore']);
    Route::put('/process-steps/{id}', [AdminAboutController::class, 'processUpdate']);
    Route::delete('/process-steps/{id}', [AdminAboutController::class, 'processDestroy']);

    Route::get('/steady-items', [AdminAboutController::class, 'steadyIndex']);
    Route::post('/steady-items', [AdminAboutController::class, 'steadyStore']);
    Route::put('/steady-items/{id}', [AdminAboutController::class, 'steadyUpdate']);
    Route::delete('/steady-items/{id}', [AdminAboutController::class, 'steadyDestroy']);
});