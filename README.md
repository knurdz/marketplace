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
   - `APPWRITE_API_KEY=` a server API key with at least **`sessions.write`** (needed for SSR auth in step 1.3; never `NEXT_PUBLIC_*`)
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local dev
4. Under **Add a platform**, add a **Web** app with hostname `localhost` (required for browser SDK CORS and recovery/verify redirect URLs).
5. Set `NEXT_PUBLIC_APP_URL` to the same origin you open in the browser (e.g. `http://localhost:3000`) so password-reset and email-verify links redirect correctly.

Clients live in [`lib/appwrite/`](./lib/appwrite/): browser (`appwrite`) + server session/admin (`node-appwrite`). Session cookie name: `knurdz_session`.

### Auth routes

| Path               | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `/login`           | Email/password sign in                      |
| `/register`        | Create account                              |
| `/account`         | Session display, verify resend, sign out    |
| `/forgot-password` | Request password recovery email             |
| `/reset-password`  | Set new password from recovery link         |
| `/verify-email`    | Complete email verification from email link |

## Status

Steps **1.1–1.4** (bootstrap through password reset / email verify) are in place. Profiles, roles, and remaining Phase 0 work continue in steps 1.5–1.13.
