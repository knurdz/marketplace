<?php

return [
    'token' => env('STORAGE_API_TOKEN', ''),
    'root' => storage_path('app/marketplace'),
    'buckets' => [
        'avatars' => [
            'max_bytes' => 2 * 1024 * 1024, // 2MB
        ],
        'product-images' => [
            'max_bytes' => 5 * 1024 * 1024, // 5MB
        ],
        'categories' => [
            'max_bytes' => 2 * 1024 * 1024, // 2MB
        ],
    ],
    'allowed_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
];
