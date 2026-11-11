<?php

use App\Http\Controllers\FileStorageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->away('https://marketplace.knurdz.org', 302);
});

Route::get('/files/{bucket}/{fileId}', [FileStorageController::class, 'show'])
    ->middleware('throttle:storage-read');
