<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileStorageController
{
    private const FILE_ID_PATTERN = '/^[A-Za-z0-9_-]{8,64}$/';

    public function store(Request $request): JsonResponse
    {
        if (! $this->hasValidBearer($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $bucket = trim((string) $request->input('bucket', ''));
        $buckets = (array) config('storage_api.buckets', []);
        if (! isset($buckets[$bucket])) {
            return response()->json(['error' => 'Invalid bucket'], 422);
        }

        if (! $request->hasFile('file')) {
            return response()->json(['error' => 'File is required'], 422);
        }

        $uploaded = $request->file('file');
        if (! $uploaded || ! $uploaded->isValid()) {
            return response()->json(['error' => 'Invalid file upload'], 422);
        }

        $maxBytes = (int) ($buckets[$bucket]['max_bytes'] ?? (5 * 1024 * 1024));
        $size = (int) $uploaded->getSize();
        if ($size <= 0 || $size > $maxBytes) {
            return response()->json(['error' => 'File exceeds bucket size limit'], 422);
        }

        $mime = strtolower((string) $uploaded->getMimeType());
        $allowedMimes = (array) config('storage_api.allowed_mimes', []);
        if (! in_array($mime, $allowedMimes, true)) {
            return response()->json(['error' => 'Unsupported file MIME type'], 422);
        }

        $requestedId = trim((string) $request->input('fileId', ''));
        if ($requestedId !== '') {
            if (! preg_match(self::FILE_ID_PATTERN, $requestedId)) {
                return response()->json(['error' => 'Invalid fileId format'], 422);
            }
            $fileId = $requestedId;
        } else {
            $fileId = (string) Str::uuid();
        }

        $dir = $this->bucketDir($bucket);
        if (! is_dir($dir) && ! mkdir($dir, 0755, true) && ! is_dir($dir)) {
            return response()->json(['error' => 'Storage directory unavailable'], 500);
        }

        $uploaded->move($dir, $fileId);

        $meta = [
            'mimeType' => $mime,
            'sizeBytes' => $size,
            'originalName' => (string) $uploaded->getClientOriginalName(),
        ];
        file_put_contents(
            $dir . DIRECTORY_SEPARATOR . $fileId . '.json',
            json_encode($meta, JSON_UNESCAPED_SLASHES)
        );

        return response()->json([
            'fileId' => $fileId,
            'bucket' => $bucket,
            'mimeType' => $mime,
            'sizeBytes' => $size,
        ], 201);
    }

    public function destroy(Request $request, string $bucket, string $fileId): JsonResponse
    {
        if (! $this->hasValidBearer($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $buckets = (array) config('storage_api.buckets', []);
        if (! isset($buckets[$bucket])) {
            return response()->json(['error' => 'Invalid bucket'], 422);
        }

        if (! preg_match(self::FILE_ID_PATTERN, $fileId)) {
            return response()->json(['error' => 'Invalid fileId format'], 422);
        }

        $dir = $this->bucketDir($bucket);
        $dataPath = $dir . DIRECTORY_SEPARATOR . $fileId;
        $metaPath = $dataPath . '.json';

        if (is_file($dataPath)) {
            @unlink($dataPath);
        }
        if (is_file($metaPath)) {
            @unlink($metaPath);
        }

        return response()->json(['ok' => true], 200);
    }

    public function show(string $bucket, string $fileId): BinaryFileResponse|JsonResponse
    {
        $buckets = (array) config('storage_api.buckets', []);
        if (! isset($buckets[$bucket])) {
            return response()->json(['error' => 'Not found'], 404);
        }

        if (! preg_match(self::FILE_ID_PATTERN, $fileId)) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $dir = $this->bucketDir($bucket);
        $dataPath = $dir . DIRECTORY_SEPARATOR . $fileId;
        if (! is_file($dataPath) || ! is_readable($dataPath)) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $mime = 'application/octet-stream';
        $metaPath = $dataPath . '.json';
        if (is_file($metaPath) && is_readable($metaPath)) {
            $decoded = json_decode((string) file_get_contents($metaPath), true);
            if (is_array($decoded) && ! empty($decoded['mimeType']) && is_string($decoded['mimeType'])) {
                $mime = $decoded['mimeType'];
            }
        } else {
            $detected = @mime_content_type($dataPath);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }

        return response()->file($dataPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function hasValidBearer(Request $request): bool
    {
        $configured = (string) config('storage_api.token', '');
        if ($configured === '') {
            return false;
        }
        $provided = (string) $request->bearerToken();
        if ($provided === '') {
            return false;
        }
        return hash_equals($configured, $provided);
    }

    private function bucketDir(string $bucket): string
    {
        $root = rtrim((string) config('storage_api.root', storage_path('app/marketplace')), DIRECTORY_SEPARATOR);
        return $root . DIRECTORY_SEPARATOR . $bucket;
    }
}
