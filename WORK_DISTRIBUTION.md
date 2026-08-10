# Work Distribution — Knurdz Marketplace

> Living document. Update when ownership or MVP scope changes.  
> Agents: after each implementation, check off every **relevant** box below for your change.

**Stack:** Next.js · Appwrite · PayHere sandbox · bank transfer · free selling  
**Roles:** Admin · Seller · Buyer  

**Sources merged:** prior Knurdz analysis + team “Full Feature Analysis” report (keep stronger options; no duplicate tasks).

---

## Principles

1. **Member 1 unblocks everyone** — finish Phase 0 before others bind UI to real Appwrite APIs.
2. **Quality & security > speed** — see `.cursor/rules/`.
3. **Graphify** — query before coding; `/graphify . --update` (or full rebuild) after meaningful code changes.
4. **Approved MCPs only** — Appwrite, PayHere docs (+ optional Merchant), Context7, next-devtools, shadcn, Playwright (see `.cursor/rules/mcp-acceleration.mdc`). No GitHub MCP; humans own commits/PRs/merges.
5. **Single-seller orders** for MVP (split cart by seller at checkout if needed).
6. **Bank verification policy (default):** admin verifies slips; sellers can escalate. Change only by updating this file.
7. **PayHere split:** Member 2 owns checkout UX; Member 4 owns hash/notify Functions and secrets — never put merchant secret in the buyer client.
8. **MVP first:** working transactions before chat, AI, referrals, or heavy analytics.

---

## Shared post-implementation checklist (all members)

Use after every change that touches code or schema:

- [ ] Re-read own changes end-to-end; no uncertain behavior left unresolved
- [ ] AuthZ checked (roles/labels + Appwrite permissions; not UI-only)
- [ ] No secrets in client / `NEXT_PUBLIC_*`
- [ ] IDOR / ownership checks on reads & writes you added
- [ ] Inputs validated (frontend + server); uploads constrained if applicable
- [ ] Payment paths (if touched): notify/hash trusted; idempotent; return_url not sole source of truth
- [ ] Graphify consulted before work (if graph exists) and updated after
- [ ] Relevant Appwrite MCP tools used when touching Appwrite (docs/context/search/call)
- [ ] Relevant member checklist items below updated
- [ ] Did not break another member’s contract (types, status enums, routes)

---

## Development phases (team sync)

| Phase | Focus | Primary owners |
|-------|--------|----------------|
| 1 — Foundation | Auth, DB, storage, shells, guards | Member 1 |
| 2 — Core marketplace | Listings, cart, checkout, orders | Members 2–3 |
| 3 — Role systems | Seller dashboard, admin panel | Members 3–4 |
| 4 — Payments | PayHere Functions + bank verify E2E | Members 2 + 4 |
| 5 — Enhancements | Reviews, notifications, creative backlog | As capacity allows |

---

## Member 1 — Foundation (must-dos first)

**Owns:** repo bootstrap, Appwrite clients, auth, schema, storage helpers, design system, seeds, route guards, shared types, service/API consistency.

### Phase 0 — blockers (do before others ship against APIs)

- [ ] Next.js (App Router) + TypeScript + lint/format + `.env.example`
- [ ] Appwrite project wiring (browser + server clients)
- [ ] Auth: register, login, logout, session, password reset, email verify
- [ ] Optional phone field on profile / registration (not required for MVP login)
- [ ] Role model (labels/teams) + middleware guards for `/seller`, `/admin`
- [ ] Database collections + indexes + permissions documented (`SCHEMA.md` or equivalent) — include at least: profiles/users, products, orders, order_items, payments, reviews (+ seller_profiles, categories, notifications, audit as needed)
- [ ] Storage buckets + shared upload helper
- [ ] UI kit / layout shells (store, seller, admin empty shells) + navbar/routing
- [ ] Shared order/payment status enums & types + thin service layer / API contracts for other members
- [ ] Seed: demo admin, seller, buyer, categories
- [ ] README setup so teammates can clone and run

### Phase 1 — ongoing

- [ ] In-app notifications collection + badge hook/UI (polling OK for MVP; realtime later)
- [ ] Global product search helper
- [ ] Basic rate limiting / abuse guards on sensitive auth & upload endpoints (or Function-level)
- [ ] Legal / FAQ static pages
- [ ] Toasts + error boundary + loading-state patterns
- [ ] Platform settings read helper
- [ ] Schema changelog when others request fields
- [ ] Coordinate PayHere Function interfaces with Member 4
- [ ] Accessibility / responsive baseline pass
- [ ] Fix cross-member integration issues; keep API contracts consistent

### Member 1 — done when

- [ ] Others can auth, hit empty role dashboards, upload a file, and read seeded products

---

## Member 2 — Buyer / storefront

**Owns:** `(store)` routes, browse, cart, checkout UX, buyer dashboard, buyer orders, wishlist/reviews UX.

**Depends on:** Member 1 Phase 0; PayHere hash/notify from Member 4 for live card path.

### Tasks

- [ ] Buyer dashboard: order summary (pending/completed), recent purchases, wishlist preview
- [ ] Browse: categories, filters, sorting
- [ ] Product detail: images, description, seller info, ratings & reviews display
- [ ] Cart add/update/remove
- [ ] Checkout (address + method: PayHere / bank / free)
- [ ] Free checkout path
- [ ] PayHere redirect + return/cancel pages (status from DB) — **UX only**; no merchant secret
- [ ] Bank transfer instructions + slip upload
- [ ] Order placement + tracking timeline + order history
- [ ] Cancel order (allowed states only)
- [ ] Report listing
- [ ] Wishlist (full page; preview on dashboard)
- [ ] Product reviews & ratings (after completed order)
- [ ] Seller ratings (from buyer after order; distinct from product review if schema allows)
- [ ] Trending / recently viewed (optional — Phase 5)
- [ ] One-click reorder (optional — Phase 5)

### Member 2 — verification extras

- [ ] Guest vs logged-in behavior is intentional and safe
- [ ] Cannot pay or view another user’s orders
- [ ] Free path never hits PayHere with a forged amount
- [ ] Filters/sort do not leak non-`active` listings

---

## Member 3 — Seller portal

**Owns:** `/seller/**`, onboarding, shop, listings, inventory, seller order fulfillment, earnings views.

**Depends on:** Member 1 Phase 0; seller approval by Member 4.

### Tasks

- [ ] Seller application form
- [ ] Pending / rejected / approved status screens
- [ ] Shop profile + public storefront (mini shop)
- [ ] Product CRUD + multi-image gallery (Appwrite Storage)
- [ ] Draft / publish / archive + category selection
- [ ] Inventory / stock + availability toggle
- [ ] Free vs paid listing toggle
- [ ] Seller dashboard: sales analytics (basic), orders summary, revenue overview
- [ ] Order inbox + status updates (`processing` / `shipped` / `completed` + pickup if used)
- [ ] Seller bank details for buyer transfers
- [ ] Earnings / completed payments list + bank payout tracking (manual OK)
- [ ] Seller settings / policy text
- [ ] Buyer ↔ seller messaging (optional / Phase 5 — basic threads only if started)
- [ ] Optional: own-order bank verify (only if policy updated)

### Member 3 — verification extras

- [ ] Sellers only mutate **own** products/orders
- [ ] Unpublished / rejected listings not publicly buyable
- [ ] Stock cannot go negative on confirm
- [ ] Availability off hides buy CTA even if stock > 0

---

## Member 4 — Admin, payments backend, trust

**Owns:** `/admin/**`, moderation, PayHere Functions, bank slip verification, platform settings, audit, reports.

**Depends on:** Member 1 Phase 0; integrates with Members 2–3 order/listing data.

### Tasks

- [ ] Admin dashboard: total users, sellers, orders, revenue insights
- [ ] Seller approval queue (approve/reject + reason)
- [ ] User management: view, ban/suspend, role tools
- [ ] Monitor seller performance (basic metrics)
- [ ] Listing moderation (approve/reject/remove inappropriate)
- [ ] Categories CRUD
- [ ] All-orders oversight + payment filters
- [ ] Dispute handling (orders flagged by buyers/sellers)
- [ ] Bank slip verification UI (approve/reject proofs)
- [ ] Appwrite Function: PayHere checkout hash
- [ ] Appwrite Function: PayHere notify verify + idempotent `paid`
- [ ] Monitor PayHere transactions + webhook / failed-notify logging view
- [ ] User/listing reports triage
- [ ] Audit log viewer
- [ ] Platform settings (sandbox flag, fees, bank copy)
- [ ] Admin order overrides (cancel/refund) with audit
- [ ] Sales reports + user growth analytics (basic charts OK)
- [ ] Seller verification badge controls
- [ ] Basic fraud flags (e.g. repeated failed pays, multi-account signals) — rules-based, not ML
- [ ] Featured product / boost tooling (optional — Phase 5; admin-controlled)
- [ ] Discount coupons admin CRUD (optional — Phase 5)
- [ ] Sandbox demo / test-card notes

### Member 4 — verification extras

- [ ] Merchant secret only in Function env
- [ ] `md5sig` verified before status change
- [ ] Duplicate notify does not double-decrement stock
- [ ] Admin actions audited
- [ ] Suspended users cannot checkout or publish

---

## Creative & advanced backlog (do not duplicate into MVP lanes)

Pick up only after Phases 1–4 are solid. Assign when claimed.

| ID | Item | Suggested owner |
|----|------|-----------------|
| X01 | CAPTCHA on register/login (optional) | Member 1 |
| X02 | Dark/light mode | Member 1 |
| X03 | Realtime notifications (vs polling) | Member 1 |
| X04 | AI product recommendations | Later |
| X05 | Referral system | Later |
| X06 | Full chat system beyond basic threads | Members 2–3 |
| X07 | Appwrite scale monitoring / limit awareness | Member 1 + 4 |

---

## Risks (track while implementing)

| Risk | Mitigation |
|------|------------|
| Bank transfer verification delays | Clear buyer status + admin queue SLAs; reminders |
| Fake sellers / spam | Approval gate, badges, reports, suspend tools |
| Appwrite limits | Lean queries, indexes, avoid N+1; monitor usage |
| UI scope creep | Freeze MVP checklists; park extras in backlog above |
| Payment secret leakage | Member 4 Functions only; Member 2 UX-only PayHere |

---

## Suggested timeline

| When | Focus |
|------|--------|
| Week 1 | Member 1 Phase 0; others wireframe / mock only |
| Week 1 end | Schema freeze v1 + seed |
| Weeks 2–3 | Members 2–4 implement portals (Phases 2–3) |
| Week 3 | E2E payments (Phase 4): PayHere + bank + free |
| Week 4 | Hardening, demo, Phase 5 extras if ahead |

---

## Status enums (do not fork)

**Product:** `draft` \| `pending_review` \| `active` \| `rejected` \| `archived`  
**Payment method:** `payhere` \| `bank_transfer` \| `free`  
**Payment status:** `pending` \| `awaiting_verification` \| `paid` \| `failed` \| `refunded`  
**Order (simplified):** `pending_payment` → `payment_review` → `paid` → `processing` → `shipped` / `ready_pickup` → `completed` \| `cancelled` / `refunded`

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-10 | Initial distribution from project analysis |
| 2026-08-10 | Merged team Full Feature Analysis: phases, filters/sort, dashboards, reviews/seller ratings, availability toggle, disputes, analytics, badges/fraud flags, backlog; clarified PayHere ownership split |
