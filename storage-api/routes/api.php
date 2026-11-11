<?php

use App\Http\Controllers\FileStorageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:storage-write')->group(function () {
    Route::post('/files', [FileStorageController::class, 'store']);
    Route::delete('/files/{bucket}/{fileId}', [FileStorageController::class, 'destroy']);
});
