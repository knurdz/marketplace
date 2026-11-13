# Hostinger all-in-one cutover

Move production from Vercel + remote MariaDB + Laravel storage to a single Hostinger **Node.js** app with **localhost** MariaDB and on-disk uploads.

## Prerequisites

- Hostinger Node.js app (Node 20) on the same account as the MariaDB database.
- `DATABASE_URL` must use `127.0.0.1`, not the Remote MySQL hostname (avoids the 500 connections/hour limit).
- `UPLOAD_DIR` set to an **absolute** path outside the deploy directory (e.g. `/home/<user>/marketplace-uploads`).

## Deploy app

1. Connect the repo to Hostinger Node.js or deploy the build artifact.
2. Set environment variables (see [README.md](../README.md) production section).
3. Build: `npm ci && npm run build` (uses webpack via `package.json`).
4. Start: `npm start` (Next.js listens on `PORT` from the host).
5. Apply schema on the server when needed: `npm run schema` with production env.

## Migrate files from Laravel storage

On the old Hostinger PHP host, files lived under:

`storage/app/marketplace/{avatars,product-images,categories}/{fileId}`

Copy each bucket into:

`$UPLOAD_DIR/{bucket}/{fileId}`

File IDs must stay identical so existing `stored_files` rows and product image references keep working. Public URLs remain same-origin `/api/files/{bucket}/{fileId}`.

Example (adjust paths):

```bash
UPLOAD=/home/USER/marketplace-uploads
SRC=/home/USER/domains/marketplace-storage.../storage/app/marketplace
for b in avatars product-images categories; do
  mkdir -p "$UPLOAD/$b"
  cp -a "$SRC/$b/." "$UPLOAD/$b/"
done
```

Optional: upload category JPEGs from the repo with `npx tsx --env-file=.env scripts/upload-category-images.ts`.

## Verification

Before DNS cutover:

- Product image loads via `/api/files/...`
- Avatar and category images load
- Login / OAuth callback on the new origin
- Purchase request flow (create, seller sold/cancel)
- SMTP verification email if testing auth

## DNS and decommission

1. Point `marketplace.knurdz.org` at the Hostinger Node app.
2. Keep Vercel and `marketplace-storage.knurdz.org` running until the above checks pass in production.
3. Disable **Remote MySQL** for this database in hPanel.
4. Remove the Laravel storage vhost and SSL for `marketplace-storage.knurdz.org`.
5. Disconnect or delete the Vercel project.

## Backups

Schedule backups for MariaDB and `UPLOAD_DIR`. Both now live on the same Hostinger account.
