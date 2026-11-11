# Knurdz Marketplace Storage API (`marketplace-storage.knurdz.org`)

Minimal Laravel 12 service for storing and serving marketplace files (`avatars`, `product-images`, and `categories`) on Hostinger while the Next.js storefront runs on Vercel.

This app lives in the monorepo under `storage-api/` (`github.com/knurdz/marketplace`). On Hostinger it is typically checked out at:

```text
~/domains/marketplace-storage.knurdz.org/public_html/storage-api
```

with either:

- **Document root** = `…/storage-api/public`, or
- **Root `.htaccess`** in `public_html` rewriting into `storage-api/public`

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

## Hostinger paths (this account)

| Tool | Path |
|------|------|
| PHP 8.4 CLI | `/opt/alt/php84/usr/bin/php` |
| Composer | `/opt/alt/php84/usr/bin/php /usr/local/bin/composer` |

Use the **same** PHP major for hPanel (Select PHP Version → **8.4**) and for Composer. Installing with 8.4 CLI while the site runs 8.3 causes platform errors.

Optional aliases in `~/.bashrc`:

```bash
alias php84='/opt/alt/php84/usr/bin/php'
alias composer84='/opt/alt/php84/usr/bin/php /usr/local/bin/composer'
```

---

## First-time setup

1. Create subdomain `marketplace-storage.knurdz.org` in hPanel. Set PHP to **8.4**.
2. Clone the marketplace repo (or pull into the existing checkout) so `storage-api/` is under the subdomain’s web tree.
3. Point the document root at `storage-api/public`, **or** keep `public_html` as root and add a rewrite `.htaccess` that sends traffic into `storage-api/public` (see below).
4. SSH in and install:

```bash
cd ~/domains/marketplace-storage.knurdz.org/public_html/storage-api
# adjust if your clone path differs

/opt/alt/php84/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader
# If there is no composer.lock yet:
# /opt/alt/php84/usr/bin/php /usr/local/bin/composer update --no-dev --optimize-autoloader

cp -n .env.example .env
/opt/alt/php84/usr/bin/php artisan key:generate
```

5. Edit `.env` (never commit this file):

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://marketplace-storage.knurdz.org
STORAGE_API_TOKEN=<strong secret — openssl rand -base64 32>
SESSION_DRIVER=array
CACHE_STORE=file
LOG_CHANNEL=single
```

6. Writable dirs:

```bash
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
mkdir -p storage/app/marketplace/avatars storage/app/marketplace/product-images storage/app/marketplace/categories
chmod -R 775 storage bootstrap/cache
```

7. Cache config:

```bash
/opt/alt/php84/usr/bin/php artisan config:clear
/opt/alt/php84/usr/bin/php artisan route:clear
/opt/alt/php84/usr/bin/php artisan config:cache
```

8. Wire the Next.js / Vercel app with the **same** token:

| Env var | Value |
|---------|--------|
| `STORAGE_API_URL` | `https://marketplace-storage.knurdz.org` |
| `STORAGE_API_TOKEN` | same as Hostinger `.env` |
| `NEXT_PUBLIC_STORAGE_URL` | `https://marketplace-storage.knurdz.org` |

Local `.env.local` uses the same three keys for `npm run dev`.

### Optional: `public_html/.htaccess` when docroot cannot change

```apache
<IfModule mod_rewrite.c>
    Options -MultiViews -Indexes
    RewriteEngine On
    RewriteBase /

    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{REQUEST_URI} ^/storage-api/public/ [NC]
    RewriteRule ^ - [L]

    RewriteRule ^(.*)$ storage-api/public/$1 [L]
</IfModule>
```

Keep Laravel’s own `.htaccess` inside `storage-api/public/`.

---

## Updating after code changes (normal deploy)

Whenever `storage-api/` changes are pushed to GitHub (routes, controller, config, `composer.json`, etc.):

```bash
cd ~/domains/marketplace-storage.knurdz.org/public_html/storage-api

# 1) Pull the branch you deploy (example: ui-updates or main)
git pull origin ui-updates

# 2) Dependencies — only if composer.json / composer.lock changed
/opt/alt/php84/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader
# If lock was regenerated and install complains, use:
# /opt/alt/php84/usr/bin/php /usr/local/bin/composer update --no-dev --optimize-autoloader

# 3) Clear and rebuild Laravel caches (always do this after pull)
/opt/alt/php84/usr/bin/php artisan config:clear
/opt/alt/php84/usr/bin/php artisan route:clear
/opt/alt/php84/usr/bin/php artisan cache:clear
rm -f bootstrap/cache/config.php bootstrap/cache/routes-v7.php bootstrap/cache/routes.php 2>/dev/null
/opt/alt/php84/usr/bin/php artisan config:cache

# 4) Permissions (safe to re-run)
chmod -R 775 storage bootstrap/cache
```

**Do not** overwrite Hostinger `.env` with `.env.example` on every deploy — keep the production `APP_KEY` and `STORAGE_API_TOKEN`.

### What changed? → what to run

| Change in git | On Hostinger |
|---------------|--------------|
| PHP / routes / controllers / config only | `git pull` + artisan clear + `config:cache` |
| `composer.json` / `composer.lock` | above **plus** `composer install` (or `update`) |
| New storage bucket folder needed | `mkdir -p storage/app/marketplace/<bucket>` + `chmod` |
| Token rotated | Update Hostinger `.env` **and** Vercel / `.env.local`, then `config:cache` |
| Next.js upload/URL code only | Redeploy Vercel (or restart local `npm run dev`); no Hostinger pull |

---

## Smoke tests after deploy

```bash
BASE=https://marketplace-storage.knurdz.org

# Root must redirect to the marketplace
curl -sSI "$BASE/" | head -8
# expect: HTTP/2 302  and  location: https://marketplace.knurdz.org

# Health
curl -sS -o /dev/null -w "%{http_code}\n" "$BASE/up"
# expect: 200

# Unauthorized write
curl -sS -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/v1/files" -F "bucket=avatars" -F "file=@/path/to/image.jpg"
# expect: 401
```

Upload test (replace `TOKEN`):

```bash
TOKEN='…from .env…'
curl -sS -X POST "$BASE/api/v1/files" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -F "bucket=avatars" \
  -F "fileId=smoke-test-001" \
  -F "file=@/path/to/small.jpg;type=image/jpeg"

curl -sSI "$BASE/files/avatars/smoke-test-001" | head -5
# expect: 200  content-type: image/jpeg

curl -sS -X DELETE "$BASE/api/v1/files/avatars/smoke-test-001" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Composer dependencies require PHP >= 8.4` but site is 8.3 | hPanel → Select PHP Version → **8.4** for this subdomain |
| `composer require` rejects `--no-dev` | Use `composer install --no-dev` or `composer update --no-dev`; for require use `--update-no-dev` |
| Packagist blocks old Laravel 11 | Stay on `laravel/framework` **^12.68.0** |
| HTTP 500 on `/` | Pull latest (session/CSRF removed from web stack); clear caches; check `storage/logs/laravel.log`; ensure `APP_KEY` is set |
| Upload 401 | Token mismatch between Hostinger `.env` and Vercel / local; empty `STORAGE_API_TOKEN` rejects all writes |
| Auth header missing on POST | Root/public `.htaccess` must pass `Authorization` (`HTTP_AUTHORIZATION`) |
| Images 404 after upload | Confirm `NEXT_PUBLIC_STORAGE_URL` and that GET uses `/files/{bucket}/{fileId}` |
| Permission denied writing files | `chmod -R 775 storage bootstrap/cache` |

Temporary debug (turn off after):

```bash
# in .env: APP_DEBUG=true
/opt/alt/php84/usr/bin/php artisan config:clear
tail -n 80 storage/logs/laravel.log
```

---

## Security notes

- Never commit `.env` or real tokens.
- Public site visitors hitting the storage hostname only see the redirect or image URLs; API writes need the bearer token.
- Rotate `STORAGE_API_TOKEN` by updating Hostinger and Vercel together, then redeploying the Next app.
