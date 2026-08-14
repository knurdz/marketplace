# Work Distribution — Knurdz Marketplace

> Living document. Update when ownership or MVP scope changes.  
> Agents: after each implementation, check off every **relevant** box below for your change.  
> Detailed step plans + agent how-to: `[docs/agent/](./docs/agent/)` (start with `docs/agent/INDEX.md`).

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
7. **Payment setup (Member 1):** PayHere hash + notify Functions, merchant secrets, free-confirm server path, `docs/agent/PAYHERE.md` implementation, webhook/notify logging, sandbox payment notes. **Never** put merchant secret in the client. Member 2 only builds checkout **UX** that calls Member 1 APIs; Member 4 does **not** own PayHere Functions.
8. **MVP first:** working transactions before chat, AI, referrals, or heavy analytics.

---

## Shared post-implementation checklist (all members)

Use after every change that touches code or schema:

- [x] Re-read own changes end-to-end; no uncertain behavior left unresolved
- [x] AuthZ checked (roles/labels + Appwrite permissions; not UI-only)
- [x] No secrets in client / `NEXT_PUBLIC_*`
- [x] IDOR / ownership checks on reads & writes you added — admin-only approve/reject + proxy checks `bankSlipFileExists`; no buyer-facing slip mutation
- [x] Inputs validated (frontend + server); uploads constrained if applicable
- [x] Payment paths (if touched): notify/hash trusted; idempotent; return_url not sole source of truth — bank approve/reject idempotent guards + TablesDB txn; live E2E pending seeded data
- [x] Graphify consulted before work (if graph exists) and updated after
- [x] Relevant Appwrite MCP tools used when touching Appwrite (docs/context/search/call)
- [x] Relevant member checklist items below updated
- [x] Did not break another member’s contract (types, status enums, routes)

---

## Development phases (team sync)


| Phase                | Focus                                                | Primary owners     |
| -------------------- | ---------------------------------------------------- | ------------------ |
| 1 — Foundation       | Auth, DB, storage, shells, guards                    | Member 1           |
| 2 — Core marketplace | Listings, cart, checkout, orders                     | Members 2–3        |
| 3 — Role systems     | Seller dashboard, admin panel                        | Members 3–4        |
| 4 — Payments         | PayHere Functions + free confirm + payment E2E setup | **Member 1**       |
| 5 — Enhancements     | Reviews, notifications, creative backlog             | As capacity allows |


---

## Member 1 — Foundation (must-dos first)

**Owns:** repo bootstrap, Appwrite clients, auth, schema, storage helpers, design system, seeds, route guards, shared types, service/API consistency, **payment setup** (PayHere Functions, secrets, free confirm, payment contract implementation).

### Phase 0 — blockers (do before others ship against APIs)

- [x] Next.js (App Router) + TypeScript + lint/format + `.env.example`
- [x] Appwrite project wiring (browser + server clients)
- [x] Auth: register, login, logout, session, password reset, email verify
- [ ] Optional phone field on profile / registration (not required for MVP login)
- [x] Role model (labels/teams) + middleware guards for `/seller`, `/admin`
- [x] Database collections + indexes + permissions documented (`docs/agent/SCHEMA.md` when created) — include at least: profiles/users, products, orders, order_items, payments, reviews (+ seller_profiles, categories, notifications, audit as needed)
- [x] Storage buckets + shared upload helper
- [x] UI kit / layout shells (store, seller, admin empty shells) + navbar/routing
- [x] Shared order/payment status enums & types + thin service layer / API contracts for other members
- [x] Seed: demo admin, seller, buyer, categories
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
| [x] **1.10** | Shared types/enums            | Product/order/payment statuses exported                              | Single source of truth                            |
| [x] **1.11** | Thin services                 | Session/product/upload helpers                                       | Others can import contracts                       |
| [x] **1.12** | Seed                          | Admin, seller, buyer, categories, sample product                     | One-command seed                                  |
| [x] **1.13** | Done gate                     | Announce unblock                                                     | Teammates can auth, shells, upload, read products |


### Phase 1 — ongoing


| Step         | Goal                        | Do                                                                  | Verify                                                 |
| ------------ | --------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| [x] **1.14** | Auth/upload rate limits     | In-process sliding window on auth + upload server actions           | Burst login/recovery blocked; recovery non-enumerating |
| [x] **1.15** | Notifications badge         | Own-only service + polling bell in store/portal nav + demo seed     | Unread badge; mark read; guest has no bell             |
| [x] **1.16** | Global product search       | `title_fulltext` + `searchActiveProducts` + `/search` verify UI     | Active-only results; empty q → []; demo “sticker” hits |
| [x] **1.17** | Legal / FAQ pages           | Static Terms, Privacy, FAQ + store footer links                     | Routes render; footer links work                       |
| [x] **1.18** | Toasts + errors + loading   | Sonner toasts, segment error.tsx / loading.tsx, profile-form sample | Toast on profile save; error/loading UI present        |
| [x] **1.19** | Platform settings reader    | `getPlatformSetting(s)` + seeded MVP keys                           | Signed-in read; guest → null; unknown key → null       |
| [x] **1.20** | PayHere Function interfaces | `PAYHERE.md` + types + `requestPayHereCheckout` stub (no secrets)   | Contract frozen; missing Function → typed error        |
| [x] **1.21** | A11y / responsive baseline  | Skip link, reduced motion, landmarks, touch targets, form alerts    | Skip→#main-content; login/profile errors wired         |


- [x] In-app notifications collection + badge hook/UI (polling OK for MVP; realtime later)
- [x] Global product search helper
- [x] Basic rate limiting / abuse guards on sensitive auth & upload endpoints (or Function-level)
- [x] Legal / FAQ static pages
- [x] Toasts + error boundary + loading-state patterns
- [x] Platform settings read helper
- [ ] Schema changelog when others request fields
- [x] PayHere Function **interfaces** (`PAYHERE.md` + types + stub) — implementation is Member 1 payment setup below
- [x] Accessibility / responsive baseline pass
- [x] Role-based post-login redirects (admin → `/admin`, seller → `/seller`, buyer → `/`); single `/login`
- [ ] Fix cross-member integration issues; keep API contracts consistent

### Payment setup (Member 1 — was formerly Members 2 + 4)

Complete payment infrastructure so Members 2–4 only consume APIs / admin UI.


| Step         | Goal                             | Do                                                                          | Verify                                                             |
| ------------ | -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [x] **1.22** | PayHere hash Function            | Appwrite Function `payhere-checkout-hash`; secret in Function env only      | Signed checkout fields from DB order                               |
| [x] **1.23** | PayHere notify Function          | `payhere-notify`; verify md5sig; idempotent `paid` + stock once             | Replay notify safe                                                 |
| [x] **1.24** | Free confirm path                | Secure server/Function confirm for `method=free` (no client-trusted amount) | Free orders mark paid once                                         |
| [x] **1.25** | Wire client stub → live Function | `requestPayHereCheckout` calls real hash Function                           | Member 2 can POST sandbox form                                     |
| [x] **1.26** | Notify / webhook failure logging | Persist failed/raw notify for ops (admin-readable later)                    | No secrets in logs/UI                                              |
| [x] **1.27** | Sandbox payment notes            | Test cards + demo steps in `docs/agent/PAYHERE.md`                          | Human-runnable                                                     |
| [x] **1.28** | Payment setup done gate          | Announce to Members 2 & 4                                                   | Free + PayHere sandbox paths work end-to-end with stub/checkout UX |


**Checklist**

- [x] Appwrite Function: PayHere checkout hash
- [x] Appwrite Function: PayHere notify verify + idempotent `paid`
- [x] Free payment confirm (server-side)
- [x] Monitor / log PayHere notify failures
- [x] Sandbox demo / test-card notes
- [x] Merchant secret only in Function env (never `NEXT_PUBLIC_*`)

### Member 1 — done when

- [x] Others can auth, hit empty role dashboards, upload a file, and read seeded products
- [x] Payment setup (1.22–1.28): others can complete free + PayHere sandbox via Member 1 Functions

---

## Member 2 — Buyer / storefront

**Owns:** `(store)` routes, browse, cart, checkout UX, buyer dashboard, buyer orders, wishlist/reviews UX.

**Depends on:** Member 1 Phase 0; **PayHere / free confirm from Member 1 payment setup (1.22–1.28)** for live card + free paid paths.

### Tasks

- [x] Buyer dashboard: order summary (pending/completed), recent purchases, wishlist preview
- [x] Browse: categories, filters, sorting
- [x] Product detail: images, description, seller info, ratings & reviews display
- [x] Cart add/update/remove
- [x] Checkout (address + method: PayHere / bank / free) — **UX only**; calls Member 1 payment APIs
- [x] Free checkout path — UI + create order; confirm via **Member 1** free-confirm API (1.24 live)
- [x] PayHere redirect + return/cancel pages (status from DB) — **UX only**; no merchant secret; uses Member 1 hash Function
- [x] Bank transfer instructions + slip upload → `awaiting_verification`
- [x] Order placement + tracking timeline + order history
- [x] Cancel order (allowed states only)
- [x] Report listing
- [x] Wishlist full page CRUD (dashboard preview → step 2.12)
- [x] Product reviews & ratings (after completed order)
- [x] Seller ratings (from buyer after order; distinct from product review if schema allows)
- [ ] Trending / recently viewed (optional — Phase 5)
- [ ] One-click reorder (optional — Phase 5)

### Step-by-step plan (implement one step at a time)


| Step         | Goal             | Do                                                       | Verify                        |
| ------------ | ---------------- | -------------------------------------------------------- | ----------------------------- |
| [x] **2.1**  | Browse list      | Category list + product grid (`status=active` only)      | Non-active never shown        |
| [x] **2.2**  | Filters & sort   | Price, category, sort by newest/price                    | Matches SCHEMA indexes        |
| [x] **2.3**  | Product detail   | Images, description, seller info, reviews slot           | 404 for inactive              |
| [x] **2.4**  | Cart             | Add/update/remove; single-seller or warn on multi-seller | Persist for logged-in user    |
| [x] **2.5**  | Checkout shell   | Address + method radio (payhere/bank/free)               | Validation clear              |
| [x] **2.6**  | Create order     | `orders` + `order_items` + `payments`                    | Ownership = current user      |
| [x] **2.7**  | Free path        | Confirm paid via **Member 1** free-confirm API           | No forged amount / no PayHere |
| [x] **2.8**  | Bank path UX     | Instructions + slip upload → `awaiting_verification`     | Private bucket                |
| [x] **2.9**  | PayHere UX       | Call **Member 1** hash Function; sandbox form; poll DB   | No merchant secret in client  |
| [x] **2.10** | Orders UI        | List + detail timeline                                   | IDOR: no other users’ orders  |
| [x] **2.11** | Cancel           | Early statuses only                                      | Enum rules enforced           |
| [x] **2.12** | Buyer dashboard  | Summaries + recent + wishlist preview                    | Empty states OK               |
| [x] **2.13** | Wishlist         | Full page CRUD                                           | Own wishlist only             |
| [x] **2.14** | Reviews          | After `completed`; product + seller rating               | Policy enforced               |
| [x] **2.15** | Report listing   | Create `reports`                                         | Feeds admin queue             |
| [ ] **2.16** | Optional Phase 5 | Trending / recently viewed / reorder                     | After MVP E2E                 |


### Member 2 — verification extras

- [x] Guest vs logged-in behavior is intentional and safe
- [x] Cannot pay or view another user’s orders
- [x] Free path never hits PayHere with a forged amount
- [x] Filters/sort do not leak non-`active` listings

---

## Member 3 — Seller portal

**Owns:** `/seller/`**, onboarding, shop, listings, inventory, seller order fulfillment, earnings views.

**Depends on:** Member 1 Phase 0; seller approval by Member 4.

### Tasks

- [x] Seller application form
- [x] Pending / rejected / approved status screens
- [x] Shop profile + public storefront (mini shop)
- [ ] Product CRUD + multi-image gallery (Appwrite Storage) — create draft + images (3.4); edit/archive in 3.5
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


| Step | Goal | Do  | Verify |
| ---- | ---- | --- | ------ |


| [x] **3.1**  | Apply form     | `seller_profiles` status=`pending`                  | One application per user          |
| [x] **3.2**  | Status screens | Pending / rejected / approved gate                  | `/seller` blocked if not approved |
| [x] **3.3**  | Shop profile   | Name, bio, banner; public shop page                 | Approved shops only public        |
| [x] **3.4**  | Create product | Draft + images                                      | Own `sellerId` only               |
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

- [x] Sellers only mutate **own** products/orders (create draft: server-forced `sellerId`)
- [x] Unpublished / rejected listings not publicly buyable (draft hidden from storefront reads)
- [ ] Stock cannot go negative on confirm
- [ ] Availability off hides buy CTA even if stock > 0

---

## Member 4 — Admin, moderation, trust

**Owns:** `/admin/`**, moderation, bank slip verification **UI**, platform settings UI, audit, reports. **Does not** own PayHere Functions or payment setup (Member 1).

**Depends on:** Member 1 Phase 0 + payment setup for accurate payment statuses; integrates with Members 2–3 order/listing data.

### Tasks

- [x] Admin dashboard: total users, sellers, orders, revenue insights
- [x] Seller approval queue (approve/reject + reason)
- [x] User management: view, ban/suspend, role tools
- [ ] Monitor seller performance (basic metrics)
- [x] Listing moderation (approve/reject/remove inappropriate)
- [x] Categories CRUD
- [x] All-orders oversight + payment filters
- [x] Dispute handling (orders flagged by buyers/sellers)
- [x] Bank slip verification UI (approve/reject proofs)
- [x] User/listing reports triage
- [x] Audit log viewer
- [x] Platform settings (sandbox flag, fees, bank copy) — admin write UI
- [ ] Admin order overrides (cancel/refund) with audit
- [x] Sales reports + user growth analytics (basic charts OK)
- [x] Seller verification badge controls
- [x] Basic fraud flags (e.g. repeated failed pays, multi-account signals) — rules-based, not ML
- [ ] Featured product / boost tooling (optional — Phase 5; admin-controlled)
- [ ] Discount coupons admin CRUD (optional — Phase 5)
- [x] Read-only view of PayHere/notify failure logs (data produced by Member 1) — optional

### Step-by-step plan (implement one step at a time)


| Step         | Goal                    | Do                                        | Verify                  |
| ------------ | ----------------------- | ----------------------------------------- | ----------------------- |
| [x] **4.1**  | Admin metrics           | Users, sellers, orders, revenue           | Admin-only              |
| [x] **4.2**  | Seller approval         | Approve → `seller` label; reject + reason | Audit logged            |
| [x] **4.3**  | User management         | View, suspend; block checkout/publish     | Server-side enforcement |
| [x] **4.4**  | Listing moderation      | Approve/reject/remove                     | Status enums only       |
| [x] **4.5**  | Categories CRUD         | Create/update/order                       | Storefront reads them   |
| [x] **4.6**  | All orders + filters    | By payment method/status                  | Admin access only       |
| [x] **4.7**  | Bank slip queue         | Approve → `paid` + stock; reject          | Idempotent; audit       |
| [x] **4.8**  | Reports / disputes      | Triage workflow                           | Status transitions      |
| [x] **4.9**  | Platform settings UI    | Sandbox, bank copy, fees (admin write)    | Safe public fields only |
| [x] **4.10** | Audit viewer            | List admin actions                        | Append-only             |
| [x] **4.11** | Analytics               | Sales + user growth                       | No PII leakage          |
| [x] **4.12** | Badges + fraud flags    | Verification badge; rule flags            | Rules documented        |
| [x] **4.13** | Notify log viewer (opt) | Read-only UI over Member 1 failure logs   | No secrets in UI        |
| [ ] **4.14** | Optional Phase 5        | Featured listings, coupons                | After E2E               |


### Member 4 — verification extras

- [x] Admin actions audited
- [x] Suspended users cannot checkout or publish
- [ ] Bank slip approve/reject is idempotent and audited
- [x] Does **not** implement PayHere Functions (Member 1)

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


| Risk                              | Mitigation                                            |
| --------------------------------- | ----------------------------------------------------- |
| Bank transfer verification delays | Clear buyer status + admin queue SLAs; reminders      |
| Fake sellers / spam               | Approval gate, badges, reports, suspend tools         |
| Appwrite limits                   | Lean queries, indexes, avoid N+1; monitor usage       |
| UI scope creep                    | Freeze MVP checklists; park extras in backlog above   |
| Payment secret leakage            | **Member 1** Functions only; Member 2 UX-only PayHere |


---

## Suggested timeline


| When       | Focus                                                             |
| ---------- | ----------------------------------------------------------------- |
| Week 1     | Member 1 Phase 0; others wireframe / mock only                    |
| Week 1 end | Schema freeze v1 + seed                                           |
| Weeks 2–3  | Members 2–4 implement portals (Phases 2–3)                        |
| Week 3     | E2E payments: Member 1 setup + Member 2 UX + Member 4 bank verify |
| Week 4     | Hardening, demo, Phase 5 extras if ahead                          |


---

## Status enums (do not fork)

**Product:** `draft`  `pending_review`  `active`  `rejected`  `archived`  
**Payment method:** `payhere`  `bank_transfer`  `free`  
**Payment status:** `pending`  `awaiting_verification`  `paid`  `failed`  `refunded`  
**Order (simplified):** `pending_payment` → `payment_review` → `paid` → `processing` → `shipped` / `ready_pickup` → `completed`  `cancelled` / `refunded`

---

