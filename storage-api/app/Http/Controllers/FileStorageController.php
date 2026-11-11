<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
        if (! $uploaded instanceof UploadedFile || ! $uploaded->isValid()) {
            return response()->json(['error' => 'Invalid file upload'], 422);
        }

        $maxBytes = (int) ($buckets[$bucket]['max_bytes'] ?? (5 * 1024 * 1024));
        $size = (int) $uploaded->getSize();
        if ($size <= 0 || $size > $maxBytes) {
            return response()->json(['error' => 'File exceeds bucket size limit'], 422);
        }

        $mime = $this->detectAllowedMime($uploaded);
        if ($mime === null) {
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

        $dataPath = $dir.DIRECTORY_SEPARATOR.$fileId;
        $metaPath = $dataPath.'.json';
        if (is_file($dataPath) || is_file($metaPath)) {
            return response()->json(['error' => 'File already exists'], 409);
        }

        $uploaded->move($dir, $fileId);

        $meta = [
            'mimeType' => $mime,
            'sizeBytes' => $size,
            'originalName' => (string) $uploaded->getClientOriginalName(),
        ];
        file_put_contents(
            $metaPath,
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
        $dataPath = $dir.DIRECTORY_SEPARATOR.$fileId;
        $metaPath = $dataPath.'.json';

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
        $dataPath = $dir.DIRECTORY_SEPARATOR.$fileId;
        if (! is_file($dataPath) || ! is_readable($dataPath)) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $allowedMimes = (array) config('storage_api.allowed_mimes', []);
        $mime = null;
        $metaPath = $dataPath.'.json';
        if (is_file($metaPath) && is_readable($metaPath)) {
            $decoded = json_decode((string) file_get_contents($metaPath), true);
            if (is_array($decoded) && ! empty($decoded['mimeType']) && is_string($decoded['mimeType'])) {
                $candidate = strtolower($decoded['mimeType']);
                if (in_array($candidate, $allowedMimes, true)) {
                    $mime = $candidate;
                }
            }
        }

        if ($mime === null) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->file($dataPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline',
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

        return $root.DIRECTORY_SEPARATOR.$bucket;
    }

    /**
     * Detect an allowed image MIME from file contents (magic bytes), not the client header.
     */
    private function detectAllowedMime(UploadedFile $uploaded): ?string
    {
        $path = $uploaded->getRealPath();
        if ($path === false || ! is_readable($path)) {
            return null;
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            return null;
        }
        $header = fread($handle, 16);
        fclose($handle);
        if ($header === false || strlen($header) < 4) {
            return null;
        }

        $allowedMimes = (array) config('storage_api.allowed_mimes', []);

        if (str_starts_with($header, "\xFF\xD8\xFF") && in_array('image/jpeg', $allowedMimes, true)) {
            return 'image/jpeg';
        }

        if (str_starts_with($header, "\x89PNG\r\n\x1A\n") && in_array('image/png', $allowedMimes, true)) {
            return 'image/png';
        }

        // WebP: RIFF....WEBP
        if (
            strlen($header) >= 12
            && str_starts_with($header, 'RIFF')
            && substr($header, 8, 4) === 'WEBP'
            && in_array('image/webp', $allowedMimes, true)
        ) {
            return 'image/webp';
        }

        return null;
    }
}
