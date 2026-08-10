# Knurdz Marketplace

Multi-role marketplace web app built with **Next.js** (frontend) and **Appwrite** (auth, database, storage, functions).

## Portals

| Portal | Who | Purpose |
|--------|-----|---------|
| Storefront | Buyers | Browse, cart, checkout, orders |
| Seller | Approved sellers | Listings, inventory, fulfillment |
| Admin | Admins | Approvals, moderation, payments oversight |

## Payments (MVP)

- **PayHere** — sandbox card checkout (server-side hash + notify verification)
- **Bank transfer** — instructions + slip upload, then verification
- **Free** — zero-price listings / checkout without a gateway

## Team

Work is split across 4 members. See **[WORK_DISTRIBUTION.md](./WORK_DISTRIBUTION.md)** for ownership, tasks, and checklists.

Member **1** finishes foundation (auth, schema, UI kit, guards) before others implement against live APIs.

## Agent / quality rules

Project Cursor rules live in `.cursor/rules/`. Priority: **security and build quality first** — never trade them for speed or token savings. Agents must use **graphify** before/after implementations and tick relevant checklist items in `WORK_DISTRIBUTION.md`.

## Status

Early setup. Schema and app code will land as Member 1 completes Phase 0.
