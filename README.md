# Knurdz Marketplace

Multi-role marketplace web app built with **Next.js** (frontend) and **Appwrite** (auth, database, storage, functions).

## Portals

| Portal     | Who              | Purpose                                   |
| ---------- | ---------------- | ----------------------------------------- |
| Storefront | Buyers           | Browse, cart, checkout, orders            |
| Seller     | Approved sellers | Listings, inventory, fulfillment          |
| Admin      | Admins           | Approvals, moderation, payments oversight |

## Payments (MVP)

- **PayHere** — sandbox card checkout (server-side hash + notify verification)
- **Bank transfer** — instructions + slip upload, then verification
- **Free** — zero-price listings / checkout without a gateway

## Team & agent docs

| Doc                                       | Location                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Work distribution, checklists, step plans | [`WORK_DISTRIBUTION.md`](./WORK_DISTRIBUTION.md) _(root)_                                  |
| Agent reference index                     | [`docs/agent/INDEX.md`](./docs/agent/INDEX.md)                                             |
| Member implementation guide               | [`docs/agent/MEMBER_IMPLEMENTATION_GUIDE.md`](./docs/agent/MEMBER_IMPLEMENTATION_GUIDE.md) |
| Cursor rules                              | [`.cursor/rules/`](./.cursor/rules/)                                                       |

Member **1** finishes foundation (auth, schema, UI kit, guards) before others implement against live APIs.

## Agent / quality rules

Priority: **security and build quality first**. Agents must use **graphify** before/after implementations, use only approved MCPs, tick checklist items in `WORK_DISTRIBUTION.md`, and **never** commit/PR/merge unless a human explicitly asks.

## Getting started

Requires Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI theme matches [knurdz.org](https://knurdz.org) (dark canvas, Space Grotesk, accent green).

| Script                 | Purpose                        |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start local Next.js dev server |
| `npm run lint`         | ESLint                         |
| `npm run format`       | Prettier write                 |
| `npm run format:check` | Prettier check                 |
| `npm run build`        | Production build               |

Fill `.env.local` with Appwrite values (see below). Do not commit secrets; only endpoint, project id, and public app URL may use `NEXT_PUBLIC_*`.

## Appwrite setup

1. Copy env: `cp .env.example .env.local`
2. In [Appwrite Console](https://cloud.appwrite.io/console) open the **Knurdz Marketplace** project.
3. Set in `.env.local`:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1` (sgp region)
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID=` project id from **Settings**
   - `APPWRITE_API_KEY=` a server API key with **`sessions.write`**, **`users.write`**, and **`databases.write`** (SSR auth + profile create-on-register; never `NEXT_PUBLIC_*`)
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local dev
4. Under **Add a platform**, add a **Web** app with hostname `localhost` (required for browser SDK CORS and recovery/verify redirect URLs).
5. Set `NEXT_PUBLIC_APP_URL` to the same origin you open in the browser (e.g. `http://localhost:3000`) so password-reset and email-verify links redirect correctly.

Clients live in [`lib/appwrite/`](./lib/appwrite/): browser (`appwrite`) + server session/admin (`node-appwrite`). Session cookie name: `knurdz_session`. TablesDB database id: `marketplace` — full table contract in [`docs/agent/SCHEMA.md`](./docs/agent/SCHEMA.md). Re-apply with `node --env-file=.env.local scripts/setup-mvp-schema.mjs`. Storage buckets (`avatars`, `product-images`, `bank-slips`): `node --env-file=.env.local scripts/setup-storage-buckets.mjs` (API key needs **storage** write).

Shared contracts for other members:

- Statuses / row types: [`lib/types/`](./lib/types/)
- Session / products / uploads: [`lib/services/`](./lib/services/)

### Demo seed (dev / sandbox only)

After schema + buckets are applied:

```bash
npm run seed
```

Creates idempotent demo users, profiles, an approved seller shop, two categories, and one **active** sample product (`seed_demo_product`).

| Role   | Email                | Labels            |
| ------ | -------------------- | ----------------- |
| Admin  | `admin@knurdz.demo`  | `buyer`, `admin`  |
| Seller | `seller@knurdz.demo` | `buyer`, `seller` |
| Buyer  | `buyer@knurdz.demo`  | `buyer`           |

Password for all demo accounts: `DemoPass123!`  
**Sandbox only** — never reuse in production. Not a merchant/Appwrite secret; do not put in `NEXT_PUBLIC_*`.

API key for seed needs **users.write** + TablesDB write (same key used for schema setup).

### Auth routes

Shared storefront `/` is the landing page for every role. There is a single `/login` (no `/admin/login` or `/seller/login`). After sign-in, users are sent to their portal: **admin → `/admin`**, **seller → `/seller`**, **buyer → `/`**. The storefront itself does not auto-redirect by role. A `?next=` return path is honored only when it is a same-origin relative URL the user’s labels may visit.

| Path               | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `/login`           | Email/password sign in (role redirect after)    |
| `/register`        | Create account (buyer → `/`)                    |
| `/account`         | Session + profile edit, verify resend, sign out |
| `/forgot-password` | Request password recovery email                 |
| `/reset-password`  | Set new password from recovery link             |
| `/verify-email`    | Complete email verification from email link     |
| `/seller`          | Seller portal (requires `seller` label)         |
| `/admin`           | Admin portal (requires `admin` label)           |

## Status

**Phase 0 complete (steps 1.1–1.13).** Member 1 foundation is ready: auth, schema, storage, UI shells, shared types/services, and demo seed. **Members 2–4 may bind UI to live Appwrite APIs.**

Setup order for a fresh clone: env → `setup-mvp-schema.mjs` → `setup-storage-buckets.mjs` → `npm run seed` → `npm run dev`.
