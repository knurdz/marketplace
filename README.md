<p align="center">
  <img src="./public/brand/logo-readme.png" alt="Knurdz Marketplace" width="320" />
</p>

**Knurdz Marketplace** is a production multi-role commerce web app: buyers discover listings and send **purchase requests**; sellers and buyers exchange contact details on those requests and complete payment off-platform. The platform does **not** process payments or hold funds. Inventory decreases only when a seller marks a request **sold**.

| Surface | URL |
| -------- | --- |
| Storefront | [https://marketplace.knurdz.org](https://marketplace.knurdz.org) |
| File host | [https://marketplace-storage.knurdz.org](https://marketplace-storage.knurdz.org) |
| Transactional email | `marketplace@knurdz.org` (Hostinger SMTP) |
| Support | [support@knurdz.org](mailto:support@knurdz.org) |

---

## What it is

Signed-in buyers open a product, choose quantity, and send a **purchase request**. On that request, each party sees the other’s phone and email (not on public listing pages). They negotiate and settle outside the app. The seller marks the request **sold** (stock decrements in a transaction) or **cancelled** (stock unchanged). Admins moderate sellers, listings, reviews, and reports.

---

## Features

### Storefront (`/`)

Browse, search, categories, shop pages, product detail, wishlist, buyer dashboard, and purchase-request tracking. Reviews are allowed after a **sold** request; public shop ratings show admin-approved reviews only.

### Seller portal (`/seller`)

Shop profile, listings (draft → review → active), inventory, and request inbox (sold / cancel). New sellers land on `/seller/pending` until an admin approves the shop.

### Admin portal (`/admin`)

Seller approval, listings and review moderation, purchase-request oversight (read-only contact context), reports, users, categories, platform settings, audit logs, analytics, and trust controls.

### Auth and trust

Email/password with verification and password reset ([Better Auth](https://www.better-auth.com/)). Optional Google and GitHub OAuth. Cloudflare Turnstile on sensitive forms. Role labels (`buyer`, `seller`, `admin`) are enforced server-side in services and route guards, not only in the UI.

### Uploads

JPEG, PNG, and WebP only (magic-byte validation). Buckets: `avatars`, `product-images`, `categories`. Per-owner quotas and throttling apply in production.

---

## Architecture

```mermaid
flowchart LR
  subgraph client [Browser]
    NextApp[Next.js App Router]
  end
  subgraph vercel [Vercel]
  NextApp --> API[Route handlers and server actions]
  end
  API --> MariaDB[(MariaDB)]
  API --> Auth[Better Auth]
  API --> SMTP[Nodemailer SMTP]
  API --> StorageAPI[Storage API Laravel]
  StorageAPI --> Disk[Hostinger disk]
  API --> LocalUploads[Local ./uploads dev only]
```

| Layer | Technology | Location |
| ----- | ---------- | -------- |
| UI | Next.js 16, React 19, Tailwind, shadcn | `app/`, `components/` |
| Data | Drizzle ORM, MariaDB 11 | `lib/db/`, `drizzle/` |
| Auth | Better Auth | `lib/auth/`, `app/api/auth/` |
| Email | Nodemailer (SMTP) | `lib/email/` |
| Business logic | Typed services | `lib/services/` |
| Files | Remote API or local disk (dev) | `lib/storage/`, `storage-api/` |

**Portals**

- Storefront: `app/(store)/`
- Auth flows: `app/(auth)/` — `/login`, `/register`, `/account`, password and email verification
- Seller: `app/seller/`
- Admin: `app/admin/`

**Storage behavior** ([`lib/storage/index.ts`](./lib/storage/index.ts))

- **Development:** If `STORAGE_API_URL` is unset, files are written under `./uploads` and served at `/api/files/{bucket}/{fileId}`.
- **Production:** Remote storage is **required**. Disk fallback throws if `STORAGE_API_URL` / `STORAGE_API_TOKEN` are missing (Vercel has no persistent local filesystem).

**References**

- Data contract: [`docs/agent/SCHEMA.md`](./docs/agent/SCHEMA.md)
- Production security and ops: [`docs/SECURITY_OPERATIONS.md`](./docs/SECURITY_OPERATIONS.md)
- Storage API deploy: [`storage-api/README.md`](./storage-api/README.md)

---

## Run locally

**Requirements:** Node.js 20+, npm.

```bash
cp .env.example .env.local
npm install
```

Configure [`.env.local`](./.env.example) before starting the app. Never commit secrets.

### MariaDB

**Option A — Docker (recommended for dev)**

```bash
docker compose up -d
```

MariaDB 11 listens on `127.0.0.1:3306`. Defaults match [`docker-compose.yml`](./docker-compose.yml):

`DATABASE_URL=mysql://knurdz:knurdz_dev@127.0.0.1:3306/marketplace`

**Option B — Your own MariaDB**

Create database `marketplace`, grant a user, then set:

`DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/marketplace`

### Schema and dev server

```bash
npm run schema    # drizzle migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Optional:** `npm run seed` loads local demo fixtures only. Do **not** run seed against production.

### File storage

| Mode | Configuration | Behavior |
| ---- | ------------- | -------- |
| Local dev | Leave `STORAGE_API_URL` unset | Writes to `./uploads`, serves `/api/files/...` |
| Remote (prod-like) | `STORAGE_API_URL`, `STORAGE_API_TOKEN`, `NEXT_PUBLIC_STORAGE_URL` | Next.js uploads via bearer token to the Laravel API |

To exercise production storage locally, point the three variables at your deployed API host (see [`storage-api/README.md`](./storage-api/README.md)).

### Environment variables (summary)

| Group | Variables | Notes |
| ----- | --------- | ----- |
| App URL | `NEXT_PUBLIC_APP_URL`, `AUTH_LOCAL_APP_URL`, `AUTH_PRODUCTION_APP_URL`, optional `AUTH_TRUSTED_ORIGINS` | OAuth redirects and email links |
| Database | `DATABASE_URL` | MariaDB connection string |
| Session / forms | `BETTER_AUTH_SECRET`, `FORM_GUARD_SECRET` | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Required for production forms |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Verification and password reset; production uses `smtp.hostinger.com`, port `465`, `SMTP_FROM="Knurdz Marketplace <marketplace@knurdz.org>"`. If the password contains `$`, escape each literal dollar as `\$` in `.env.local` (Next.js expands `$VAR`). |
| OAuth (optional) | `GOOGLE_*`, `GITHUB_*` | Leave empty to disable |
| Storage (production) | `STORAGE_API_URL`, `STORAGE_API_TOKEN`, `NEXT_PUBLIC_STORAGE_URL` | Production: `https://marketplace-storage.knurdz.org` |

Full comments: [`.env.example`](./.env.example).

---

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run schema` | Apply Drizzle migrations |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run test:security` | Security unit tests |
| `npm run test:e2e` | Playwright E2E (install Chromium: `npx playwright install chromium`) |

---

## Production

| Component | Deployment |
| --------- | ------------ |
| Next.js app | Vercel (`marketplace.knurdz.org`) |
| Database | External MariaDB (`DATABASE_URL` on Vercel) |
| Files | Laravel storage API on Hostinger — **mandatory** (no disk on Vercel) |
| Email | Hostinger SMTP as `marketplace@knurdz.org` |

Deploy and update the file service using [`storage-api/README.md`](./storage-api/README.md).

**Required production secrets** (names only; set in the host’s env UI):

- `BETTER_AUTH_SECRET`, `FORM_GUARD_SECRET`
- `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `STORAGE_API_URL`, `STORAGE_API_TOKEN`, `NEXT_PUBLIC_STORAGE_URL`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `DATABASE_URL`

Edge rate limiting, CSP, and rotation policy: [`docs/SECURITY_OPERATIONS.md`](./docs/SECURITY_OPERATIONS.md).

---

## Purchase request lifecycle

1. Buyer (with profile phone) requests quantity ≤ available stock → status `requested`; stock unchanged.
2. Buyer and seller see each other’s phone and email on the request detail view.
3. Seller marks **sold** → stock decrements if sufficient; **cancelled** → no stock change.
4. Buyer may leave a review linked to the sold request; admin approves before it appears on the shop.
