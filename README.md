# Knurdz Marketplace

Multi-role marketplace web app built with **Next.js**, **MariaDB** (Drizzle), **Better Auth**, and file storage (local disk in dev; Hostinger Laravel API in production). The platform connects buyers and sellers; it does **not** process payments.

**Production file hosting:** [`storage-api/README.md`](./storage-api/README.md) — deploy/update steps for `marketplace-storage.knurdz.org` on Hostinger.

## Portals

| Portal     | Who              | Purpose                                              |
| ---------- | ---------------- | ---------------------------------------------------- |
| Storefront | Buyers           | Browse, wishlist, send buy requests                  |
| Seller     | Approved sellers | Listings, inventory, resolve buy requests            |
| Admin      | Admins           | Approvals, moderation, read-only request oversight   |

## Buy flow (MVP)

1. Buyer opens a product, chooses a quantity, and taps **Buy**.
2. A request is created; both sides see phone and email on that request.
3. They settle the sale personally.
4. Seller marks the request **sold** (stock decreases) or **cancelled** (stock unchanged).

See [`docs/agent/SCHEMA.md`](./docs/agent/SCHEMA.md).

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
| `npm run test:e2e`     | Playwright contact-request smoke suite |

Set `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` in `.env.local` (see `.env.example`). Do not commit secrets.

## MariaDB setup

```bash
docker compose up -d
npm run schema    # drizzle migrate
npm run seed      # demo users + sample product
```

Default DB URL: `mysql://knurdz:knurdz_dev@127.0.0.1:3306/marketplace`

Server helpers live in [`lib/backend/`](./lib/backend/) (session, roles, storage wrappers). Table contract: [`docs/agent/SCHEMA.md`](./docs/agent/SCHEMA.md). Shared contracts for other members:

- Statuses / row types: [`lib/types/`](./lib/types/)
- Session / products / uploads: [`lib/services/`](./lib/services/)

### Demo seed (dev / sandbox only)

After migrations:

```bash
npm run seed
```

Creates idempotent demo users, profiles, **two** approved seller shops, categories, and sample products for local testing.

| Role    | Email                  | Labels            | Shop slug      |
| ------- | ---------------------- | ----------------- | -------------- |
| Admin   | `admin@knurdz.demo`    | `buyer`, `admin`  | —              |
| Seller  | `seller@knurdz.demo`   | `buyer`, `seller` | `demo-shop`    |
| Seller  | `seller2@knurdz.demo`  | `buyer`, `seller` | `paper-trail`  |
| Buyer   | `buyer@knurdz.demo`    | `buyer`           | —              |

Sample SKUs: `seed_demo_product` (500 LKR), `seed_demo_free_product` (free), `seed_demo_tote` (goods), `seed_seller2_digital`, `seed_seller2_goods`.

Password for all demo accounts: `DemoPass123!`  
**Sandbox only** — never reuse in production.

### Auth routes

Shared storefront `/` is the buyer landing page. There is a single `/login` (no `/admin/login` or `/seller/login`). After sign-in, users are sent to their portal: **admin → `/admin`**, **seller → `/seller`**, **pending seller → `/seller/pending`**, **buyer → `/market`**. Admins and sellers cannot browse the buyer market. A `?next=` return path is honored only when it is a same-origin relative URL the user’s labels may visit.

| Path               | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `/login`           | Email/password sign in (role redirect after)    |
| `/register`        | Create account (buyer or seller application)    |
| `/account`         | Session + profile edit, verify resend, sign out |
| `/forgot-password` | Request password recovery email                 |
| `/reset-password`  | Set new password from recovery link             |
| `/verify-email`    | Complete email verification from email link     |
| `/seller`          | Seller portal (requires `seller` label)         |
| `/seller/pending`  | Holding page until admin approves a shop        |
| `/admin`           | Admin portal (requires `admin` label)           |

## Status

**Phase 0 complete (steps 1.1–1.13).** Member 1 foundation is ready: auth, schema, storage, UI shells, shared types/services, and demo seed.

Setup order for a fresh clone: `cp .env.example .env.local` → `docker compose up -d` → `npm run schema` → `npm run seed` → `npm run dev`.

### E2E tests (Phase 6.18)

Requires `.env.local`, seeded categories, and a running dev server (Playwright starts one locally unless `CI` is set).

```bash
npx playwright install chromium
npm run test:e2e
```

Uses unique `@knurdz.demo` emails per run. Default password matches demo seed:
`DemoPass123!` (override with `E2E_PASSWORD`).
