<?php

use App\Http\Controllers\FileStorageController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', function (): RedirectResponse {
    return new RedirectResponse('https://marketplace.knurdz.org', 302);
});

Route::get('/files/{bucket}/{fileId}', [FileStorageController::class, 'show'])
    ->middleware('throttle:storage-read');
