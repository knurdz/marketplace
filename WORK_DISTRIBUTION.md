# Work Distribution — Knurdz Marketplace

> Living document. Update when ownership or MVP scope changes.  
> Agents: after each implementation, check off every **relevant** box below for your change.  
> Detailed step plans + agent how-to: [`docs/agent/`](./docs/agent/) (start with `docs/agent/INDEX.md`).

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

| Phase                | Focus                                    | Primary owners     |
| -------------------- | ---------------------------------------- | ------------------ |
| 1 — Foundation       | Auth, DB, storage, shells, guards        | Member 1           |
| 2 — Core marketplace | Listings, cart, checkout, orders         | Members 2–3        |
| 3 — Role systems     | Seller dashboard, admin panel            | Members 3–4        |
| 4 — Payments         | PayHere Functions + bank verify E2E      | Members 2 + 4      |
| 5 — Enhancements     | Reviews, notifications, creative backlog | As capacity allows |

---

## Member 1 — Foundation (must-dos first)

**Owns:** repo bootstrap, Appwrite clients, auth, schema, storage helpers, design system, seeds, route guards, shared types, service/API consistency.

### Phase 0 — blockers (do before others ship against APIs)

- [x] Next.js (App Router) + TypeScript + lint/format + `.env.example`
- [x] Appwrite project wiring (browser + server clients)
- [x] Auth: register, login, logout, session, password reset, email verify
- [ ] Optional phone field on profile / registration (not required for MVP login)
- [x] Role model (labels/teams) + middleware guards for `/seller`, `/admin`
- [x] Database collections + indexes + permissions documented (`docs/agent/SCHEMA.md` when created) — include at least: profiles/users, products, orders, order_items, payments, reviews (+ seller_profiles, categories, notifications, audit as needed)
- [x] Storage buckets + shared upload helper
- [x] UI kit / layout shells (store, seller, admin empty shells) + navbar/routing
- [ ] Shared order/payment status enums & types + thin service layer / API contracts for other members
- [ ] Seed: demo admin, seller, buyer, categories
- [x] README setup so teammates can clone and run

### Phase 0 — step-by-step plan (implement one step at a time)

| Step         | Goal                          | Do                                                                   | Verify                                            |
| ------------ | ----------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| [x] **1.1**  | Bootstrap Next.js             | App Router, TS, ESLint/Prettier, `.env.example`, README run steps    | `npm run dev` works                               |
| [x] **1.2**  | Appwrite clients              | Browser + server clients in `lib/appwrite`; env documented           | Session null-safe / project reachable             |
| [x] **1.3**  | Auth pages                    | Register, login, logout, session display                             | Round-trip auth                                   |
| [x] **1.4**  | Password reset + email verify | Recovery + verify flows                                              | Links work in dev                                 |
| [x] **1.5**  | Profiles                      | `profiles` linked to `userId`; create on register                    | Profile after signup; own-only update             |
| [x] **1.6**  | Roles & guards                | Labels/teams; middleware for `/seller`, `/admin`                     | Buyer blocked from admin                          |
| [x] **1.7**  | Schema + collections          | All MVP collections + indexes + permissions → `docs/agent/SCHEMA.md` | Doc matches console                               |
| [x] **1.8**  | Storage                       | Buckets + upload helper (private bank slips)                         | Avatar upload works                               |
| [x] **1.9**  | UI kit + shells               | Store/seller/admin layouts + navbar                                  | Empty dashboards render                           |
| [ ] **1.10** | Shared types/enums            | Product/order/payment statuses exported                              | Single source of truth                            |
| [ ] **1.11** | Thin services                 | Session/product/upload helpers                                       | Others can import contracts                       |
| [ ] **1.12** | Seed                          | Admin, seller, buyer, categories, sample product                     | One-command seed                                  |
| [ ] **1.13** | Done gate                     | Announce unblock                                                     | Teammates can auth, shells, upload, read products |

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

### Step-by-step plan (implement one step at a time)

| Step         | Goal             | Do                                                       | Verify                        |
| ------------ | ---------------- | -------------------------------------------------------- | ----------------------------- |
| [ ] **2.1**  | Browse list      | Category list + product grid (`status=active` only)      | Non-active never shown        |
| [ ] **2.2**  | Filters & sort   | Price, category, sort by newest/price                    | Matches SCHEMA indexes        |
| [ ] **2.3**  | Product detail   | Images, description, seller info, reviews slot           | 404 for inactive              |
| [ ] **2.4**  | Cart             | Add/update/remove; single-seller or warn on multi-seller | Persist for logged-in user    |
| [ ] **2.5**  | Checkout shell   | Address + method radio (payhere/bank/free)               | Validation clear              |
| [ ] **2.6**  | Create order     | `orders` + `order_items` + `payments`                    | Ownership = current user      |
| [ ] **2.7**  | Free path        | Confirm paid via agreed secure server path               | No forged amount / no PayHere |
| [ ] **2.8**  | Bank path UX     | Instructions + slip upload → `awaiting_verification`     | Private bucket                |
| [ ] **2.9**  | PayHere UX       | Hash Function + sandbox form; return/cancel poll DB      | No merchant secret in client  |
| [ ] **2.10** | Orders UI        | List + detail timeline                                   | IDOR: no other users’ orders  |
| [ ] **2.11** | Cancel           | Early statuses only                                      | Enum rules enforced           |
| [ ] **2.12** | Buyer dashboard  | Summaries + recent + wishlist preview                    | Empty states OK               |
| [ ] **2.13** | Wishlist         | Full page CRUD                                           | Own wishlist only             |
| [ ] **2.14** | Reviews          | After `completed`; product + seller rating               | Policy enforced               |
| [ ] **2.15** | Report listing   | Create `reports`                                         | Feeds admin queue             |
| [ ] **2.16** | Optional Phase 5 | Trending / recently viewed / reorder                     | After MVP E2E                 |

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

### Step-by-step plan (implement one step at a time)

| Step         | Goal           | Do                                                  | Verify                            |
| ------------ | -------------- | --------------------------------------------------- | --------------------------------- |
| [ ] **3.1**  | Apply form     | `seller_profiles` status=`pending`                  | One application per user          |
| [ ] **3.2**  | Status screens | Pending / rejected / approved gate                  | `/seller` blocked if not approved |
| [ ] **3.3**  | Shop profile   | Name, bio, banner; public shop page                 | Approved shops only public        |
| [ ] **3.4**  | Create product | Draft + images                                      | Own `sellerId` only               |
| [ ] **3.5**  | Edit / archive | Update / archive                                    | Cannot edit others’ products      |
| [ ] **3.6**  | Publish flow   | `draft` → `pending_review` / `active` per policy    | Align with Member 4 moderation    |
| [ ] **3.7**  | Inventory      | Stock + availability toggle                         | Unavailable hides buy CTA         |
| [ ] **3.8**  | Free listing   | `price=0` / `isFree`                                | Buyer free path works             |
| [ ] **3.9**  | Dashboard KPIs | Orders, revenue, pending                            | Own data only                     |
| [ ] **3.10** | Order inbox    | List seller’s orders                                | Filter by sellerId                |
| [ ] **3.11** | Fulfillment    | `processing` → `shipped`/`ready_pickup` → completed | Invalid transitions rejected      |
| [ ] **3.12** | Bank details   | Fields for buyer bank checkout                      | Least exposure                    |
| [ ] **3.13** | Earnings       | Paid orders; manual payout note                     | Matches `paid` payments           |
| [ ] **3.14** | Settings       | Policy text                                         | Visible on shop/product           |
| [ ] **3.15** | Optional       | Messaging / own bank verify                         | Only if policy updated            |

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

### Step-by-step plan (implement one step at a time)

| Step         | Goal                    | Do                                        | Verify                      |
| ------------ | ----------------------- | ----------------------------------------- | --------------------------- |
| [ ] **4.1**  | Admin metrics           | Users, sellers, orders, revenue           | Admin-only                  |
| [ ] **4.2**  | Seller approval         | Approve → `seller` label; reject + reason | Audit logged                |
| [ ] **4.3**  | User management         | View, suspend; block checkout/publish     | Server-side enforcement     |
| [ ] **4.4**  | Listing moderation      | Approve/reject/remove                     | Status enums only           |
| [ ] **4.5**  | Categories CRUD         | Create/update/order                       | Storefront reads them       |
| [ ] **4.6**  | All orders + filters    | By payment method/status                  | Admin access only           |
| [ ] **4.7**  | Bank slip queue         | Approve → `paid` + stock; reject          | Idempotent; audit           |
| [ ] **4.8**  | PayHere hash Function   | orderId → form fields + hash              | Secret in Function env only |
| [ ] **4.9**  | PayHere notify Function | Verify md5sig; paid once; stock once      | Replay-safe                 |
| [ ] **4.10** | Webhook log UI          | Failed/raw notify view                    | No secrets in UI            |
| [ ] **4.11** | Contract with M2        | Document hash + free-confirm API          | In `docs/agent/`            |
| [ ] **4.12** | Reports / disputes      | Triage workflow                           | Status transitions          |
| [ ] **4.13** | Platform settings       | Sandbox, bank copy, fees                  | Safe public fields only     |
| [ ] **4.14** | Audit viewer            | List admin actions                        | Append-only                 |
| [ ] **4.15** | Analytics               | Sales + user growth                       | No PII leakage              |
| [ ] **4.16** | Badges + fraud flags    | Verification badge; rule flags            | Rules documented            |
| [ ] **4.17** | Sandbox notes           | Test cards / demo script                  | Human-runnable              |
| [ ] **4.18** | Optional Phase 5        | Featured listings, coupons                | After E2E                   |

### Member 4 — verification extras

- [ ] Merchant secret only in Function env
- [ ] `md5sig` verified before status change
- [ ] Duplicate notify does not double-decrement stock
- [ ] Admin actions audited
- [ ] Suspended users cannot checkout or publish

---

## Creative & advanced backlog (do not duplicate into MVP lanes)

Pick up only after Phases 1–4 are solid. Assign when claimed.

| ID  | Item                                        | Suggested owner |
| --- | ------------------------------------------- | --------------- |
| X01 | CAPTCHA on register/login (optional)        | Member 1        |
| X02 | Dark/light mode                             | Member 1        |
| X03 | Realtime notifications (vs polling)         | Member 1        |
| X04 | AI product recommendations                  | Later           |
| X05 | Referral system                             | Later           |
| X06 | Full chat system beyond basic threads       | Members 2–3     |
| X07 | Appwrite scale monitoring / limit awareness | Member 1 + 4    |

---

## Risks (track while implementing)

| Risk                              | Mitigation                                          |
| --------------------------------- | --------------------------------------------------- |
| Bank transfer verification delays | Clear buyer status + admin queue SLAs; reminders    |
| Fake sellers / spam               | Approval gate, badges, reports, suspend tools       |
| Appwrite limits                   | Lean queries, indexes, avoid N+1; monitor usage     |
| UI scope creep                    | Freeze MVP checklists; park extras in backlog above |
| Payment secret leakage            | Member 4 Functions only; Member 2 UX-only PayHere   |

---

## Suggested timeline

| When       | Focus                                          |
| ---------- | ---------------------------------------------- |
| Week 1     | Member 1 Phase 0; others wireframe / mock only |
| Week 1 end | Schema freeze v1 + seed                        |
| Weeks 2–3  | Members 2–4 implement portals (Phases 2–3)     |
| Week 3     | E2E payments (Phase 4): PayHere + bank + free  |
| Week 4     | Hardening, demo, Phase 5 extras if ahead       |

---

## Status enums (do not fork)

**Product:** `draft` \| `pending_review` \| `active` \| `rejected` \| `archived`  
**Payment method:** `payhere` \| `bank_transfer` \| `free`  
**Payment status:** `pending` \| `awaiting_verification` \| `paid` \| `failed` \| `refunded`  
**Order (simplified):** `pending_payment` → `payment_review` → `paid` → `processing` → `shipped` / `ready_pickup` → `completed` \| `cancelled` / `refunded`

---

## Change log

| Date       | Change                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-10 | Initial distribution from project analysis                                                                                                                                                            |
| 2026-08-10 | Merged team Full Feature Analysis: phases, filters/sort, dashboards, reviews/seller ratings, availability toggle, disputes, analytics, badges/fraud flags, backlog; clarified PayHere ownership split |
| 2026-08-10 | Added numbered step plans (1.1–4.18) matching `docs/agent/MEMBER_IMPLEMENTATION_GUIDE.md`                                                                                                             |
