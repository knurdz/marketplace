# Knurdz Marketplace Storage API (`marketplace-storage.knurdz.org`)

Minimal Laravel 12 service for storing and serving marketplace files (`avatars`, `product-images`, and `categories`) on Hostinger while the Next.js storefront runs on Vercel.

## Behaviour

| Path | Behaviour |
|------|-----------|
| `GET /` | **302** redirect to `https://marketplace.knurdz.org` |
| `GET /up` | Health check (Laravel) |
| `GET /files/{bucket}/{fileId}` | Public image stream (allowlisted MIME only) |
| `POST` / `DELETE` `/api/v1/files…` | Bearer token required; never public |

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/files` | `Authorization: Bearer <STORAGE_API_TOKEN>` | Multipart upload (`bucket`, `file`, optional `fileId`). Allowed buckets: `avatars` (max 2MB), `product-images` (max 5MB), `categories` (max 2MB). Content must be JPEG, PNG, or WebP (magic-byte checked). Existing `fileId` returns **409**. Throttled ~30/min/IP. |
| `DELETE` | `/api/v1/files/{bucket}/{fileId}` | `Authorization: Bearer <STORAGE_API_TOKEN>` | Deletes a stored file and its metadata sidecar (idempotent `200`). Same write throttle. |
| `GET` | `/files/{bucket}/{fileId}` | Public | Streams the file with allowlisted `Content-Type`, `Content-Disposition: inline`, `Cache-Control: public, max-age=86400`, `X-Content-Type-Options: nosniff`. Throttled ~120/min/IP. |

Writes reject requests when `STORAGE_API_TOKEN` is empty. Tokens are compared with `hash_equals`. JSON errors never include filesystem paths.

## Hostinger Deployment

1. Place the app under the subdomain (e.g. `public_html/storage-api`) and either set the **document root** to `storage-api/public`, or use a root `.htaccess` that rewrites into `storage-api/public`.
2. Use **PHP 8.4** for both the website (hPanel → Select PHP Version) and Composer CLI.
3. Install dependencies:
   ```bash
   /opt/alt/php84/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader
   # If there is no composer.lock yet:
   # /opt/alt/php84/usr/bin/php /usr/local/bin/composer update --no-dev --optimize-autoloader
   cp .env.example .env
   /opt/alt/php84/usr/bin/php artisan key:generate
   ```
   Requires `laravel/framework` **^12.68.0** (security-patched).
4. Set `APP_URL=https://marketplace-storage.knurdz.org` and a strong `STORAGE_API_TOKEN` in `.env` (never commit `.env`).
5. Ensure `storage/` and `bootstrap/cache/` are writable:
   ```bash
   chmod -R 775 storage bootstrap/cache
   mkdir -p storage/app/marketplace/avatars storage/app/marketplace/product-images storage/app/marketplace/categories
   chmod -R 775 storage/app/marketplace
   ```
6. After each deploy/pull:
   ```bash
   /opt/alt/php84/usr/bin/php artisan config:clear
   /opt/alt/php84/usr/bin/php artisan route:clear
   /opt/alt/php84/usr/bin/php artisan config:cache
   ```
7. Configure the Next.js app (Vercel) with matching environment variables:
   - `STORAGE_API_URL=https://marketplace-storage.knurdz.org`
   - `STORAGE_API_TOKEN=<same secret token>`
   - `NEXT_PUBLIC_STORAGE_URL=https://marketplace-storage.knurdz.org`
