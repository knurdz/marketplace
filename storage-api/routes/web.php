<?php

use App\Http\Controllers\FileStorageController;
use Illuminate\Support\Facades\Route;

Route::get('/files/{bucket}/{fileId}', [FileStorageController::class, 'show']);
