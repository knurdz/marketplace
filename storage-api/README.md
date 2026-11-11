# Knurdz Marketplace Storage API (`marketplace-storage.knurdz.org`)

Minimal Laravel 11 service for storing and serving marketplace files (`avatars` and `product-images`) on Hostinger while the Next.js storefront runs on Vercel.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/files` | `Authorization: Bearer <STORAGE_API_TOKEN>` | Multipart upload (`bucket`, `file`, optional `fileId`). Allowed buckets: `avatars` (max 2MB), `product-images` (max 5MB). Allowed MIME: `image/jpeg`, `image/png`, `image/webp`. |
| `DELETE` | `/api/v1/files/{bucket}/{fileId}` | `Authorization: Bearer <STORAGE_API_TOKEN>` | Deletes a stored file and its metadata sidecar (idempotent `200`). |
| `GET` | `/files/{bucket}/{fileId}` | Public | Streams the file with stored `Content-Type` and `Cache-Control: public, max-age=86400`. |

## Hostinger Deployment

1. Point the subdomain `marketplace-storage.knurdz.org` to this folder and set the **document root** to `public/`.
2. Use **PHP 8.2+**.
3. Install dependencies and configure environment:
   ```bash
   composer install --no-dev --optimize-autoloader
   cp .env.example .env
   php artisan key:generate
   ```
4. Set `APP_URL=https://marketplace-storage.knurdz.org` and a strong `STORAGE_API_TOKEN` in `.env` (never commit `.env`).
5. Ensure `storage/` and `bootstrap/cache/` are writable by the web server:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```
6. Configure the Next.js app (Vercel) with matching environment variables:
   - `STORAGE_API_URL=https://marketplace-storage.knurdz.org`
   - `STORAGE_API_TOKEN=<same secret token>`
   - `NEXT_PUBLIC_STORAGE_URL=https://marketplace-storage.knurdz.org`
