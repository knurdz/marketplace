# Knurdz Marketplace — Member Implementation Guide (Agent Reference)

**Audience:** Members 1–4 and their coding agents  
**Purpose:** Know what you own, what depends on what, and how to implement in **small, low-error steps**  
**Canonical checklists + step plans:** [`WORK_DISTRIBUTION.md`](../../WORK_DISTRIBUTION.md) (repo root)  
**Agent doc index:** [`INDEX.md`](./INDEX.md)  
**Rules:** [`.cursor/rules/`](../../.cursor/rules/)  
**Git:** Humans commit / PR / merge — agents do not (`.cursor/rules/human-git-control.mdc`)

> Paste the **Member N** section into your agent as the project brief. After each step, tick `WORK_DISTRIBUTION.md` and run the shared verification checklist.

---

## 1. What you are building

A **3-portal marketplace**:

| Portal     | Path (suggested) | Users            |
| ---------- | ---------------- | ---------------- |
| Storefront | `/`              | Buyers           |
| Seller     | `/seller/**`     | Approved sellers |
| Admin      | `/admin/**`      | Admins           |

**Payments (MVP):** PayHere sandbox · bank transfer (admin verifies slips) · free (`price = 0`).  
**Business model:** Free selling (no paid listing fee required for MVP).  
**Order model:** **One seller per order** (split cart by seller at checkout).

**Success for MVP:** A buyer can discover a product, check out via all 3 payment paths, a seller can fulfill, and an admin can approve sellers and verify bank slips — securely.

---

## 2. Technical stack (detail)

| Layer              | Choice                                         | Notes for agents                                                 |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------- |
| Frontend           | **Next.js App Router + TypeScript**            | Server Components where possible; client for forms/cart          |
| Styling/UI         | Team choice (prefer **shadcn** via MCP)        | Match Member 1 UI kit once it exists                             |
| Auth               | **Appwrite Auth**                              | Sessions; email verify; password recovery                        |
| Roles              | Appwrite **labels** and/or **Teams**           | `buyer` default, `seller` after approval, `admin` elevated       |
| Database           | **Appwrite Databases / TablesDB**              | Collections below; document permissions                          |
| Files              | **Appwrite Storage**                           | Public product images; private bank slips / digital goods        |
| Secrets / webhooks | **Appwrite Functions**                         | PayHere hash + `notify_url` only here                            |
| Payments           | **PayHere sandbox**                            | `https://sandbox.payhere.lk/pay/checkout`; trust notify + md5sig |
| Local quality      | Graphify before/after · Playwright MCP for E2E | See MCP list below                                               |

### Approved MCPs (agents)

1. Appwrite MCP
2. PayHere docs MCP (+ optional PayHere Merchant MCP — sandbox secrets only)
3. Context7
4. next-devtools-mcp
5. shadcn MCP
6. Playwright MCP

**Do not use GitHub MCP.** Do not use Supabase for this app’s data.

### Suggested env (Member 1 defines `.env.example`)

```text
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APP_URL=
# Server / Function only — never NEXT_PUBLIC:
APPWRITE_API_KEY=
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_SANDBOX=true
```

### Suggested folder layout (Member 1 establishes; others follow)

```text
app/
  (auth)/login|register|...
  (store)/...                 # Member 2
  (seller)/seller/...         # Member 3
  (admin)/admin/...           # Member 4
lib/appwrite/                 # clients, helpers (Member 1)
lib/types/ | types/           # shared enums (Member 1)
components/ui/                # design system (Member 1)
functions/                    # PayHere Functions (Member 1 payment setup)
docs/agent/                   # Agent reference docs (guide, schema, PayHere contract)
WORK_DISTRIBUTION.md          # Root — checklists + step plans
```

---

## 3. Shared contracts (do not fork)

### Status enums

- **Product:** `draft` | `pending_review` | `active` | `rejected` | `archived`
- **Payment method:** `payhere` | `bank_transfer` | `free`
- **Payment status:** `pending` | `awaiting_verification` | `paid` | `failed` | `refunded`
- **Order:** `pending_payment` → `payment_review` → `paid` → `processing` → `shipped` / `ready_pickup` → `completed` | `cancelled` / `refunded`

### Ownership of payments

| Piece                                                              | Owner                         |
| ------------------------------------------------------------------ | ----------------------------- |
| PayHere Functions, merchant secret, free confirm, notify logging   | **Member 1** (setup 1.22–1.28)|
| Checkout UI, return/cancel pages, slip upload UX                   | **Member 2** (calls Member 1) |
| Bank slip **approve/reject** admin UI                              | **Member 4** (default policy) |

### Minimum collections (Member 1 creates)

`profiles`, `seller_profiles`, `categories`, `products`, `product_images` (or image IDs on product), `carts`/`cart_items` (or client+server cart), `orders`, `order_items`, `payments`, `bank_slips`, `reviews`, `reports`, `notifications`, `platform_settings`, `audit_logs`, `payhere_notify_logs`

### Agent rules every step

1. Quality/security > speed (`.cursor/rules/quality-and-certainty.mdc`, `security-first.mdc`)
2. Graphify query before; `--update` after
3. Tick `WORK_DISTRIBUTION.md`
4. Humans commit — leave changes for human
5. After each **small** step: build/typecheck, authZ/IDOR pass, no secrets in client

---

## 4. How agents should work (all members)

### Per-step loop (mandatory)

```text
1. Read this Member section + WORK_DISTRIBUTION.md for your lane
2. Graphify query the area you will touch (if graph exists)
3. Use MCP (Appwrite / Context7 / PayHere docs / shadcn) — don't invent APIs
4. Implement ONE step below (smallest vertical slice)
5. Security + certainty re-read
6. Tick checklist items
7. Graphify update
8. STOP for human commit — summarize what changed
9. Only then start next step
```

### Starter prompt template (copy/paste)

```text
You are implementing Knurdz Marketplace for Member {N}.
Read first: docs/agent/INDEX.md, WORK_DISTRIBUTION.md (root), docs/agent/MEMBER_IMPLEMENTATION_GUIDE.md § Member {N}, and .cursor/rules/*.
Stack: Next.js App Router + Appwrite. Do not commit/push/PR.
Complete ONLY Step {X}: {title}.
Constraints: {enums / ownership / security}.
After: verify checklist, graphify update if code changed, summarize for human commit.
```

---

## 5. Member 1 — Core infrastructure (critical path)

### You are building

The **platform foundation** everyone else plugs into: Appwrite wiring, auth, roles, schema, storage, UI shells, shared types, seeds.

### Blocker rule

**Members 2–4 must not bind production UI to live Appwrite until Member 1 Phase 0 “done when” is met.** They may mock UI earlier.

### Dependencies

None (you start first). Own **payment setup** (PayHere Functions + free confirm) after Phase 0 — see steps 1.22–1.28.

### Step-by-step plan (small slices)

| Step     | Goal                          | Do                                                                        | Verify                                     | Agent prompt hint                                                           |
| -------- | ----------------------------- | ------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| **1.1**  | Bootstrap Next.js             | App Router, TS, ESLint/Prettier, `.env.example`, README run steps         | `npm run dev` works                        | “Scaffold Next.js only; no features yet.”                                   |
| **1.2**  | Appwrite clients              | Browser + server clients in `lib/appwrite`; env documented                | Can ping project / get session null safely | “Use Appwrite MCP docs; no secrets in NEXT_PUBLIC except endpoint/project.” |
| **1.3**  | Auth pages                    | Register, login, logout, session display                                  | Round-trip auth                            | “Email/password only; optional phone on profile later.”                     |
| **1.4**  | Password reset + email verify | Recovery + verify flows                                                   | Links work in sandbox/dev                  | “Wire Appwrite recovery/verification; clear error toasts.”                  |
| **1.5**  | Profiles collection           | `profiles` linked to `userId`; create on register                         | Profile exists after signup                | “Least-privilege permissions; user updates own profile only.”               |
| **1.6**  | Roles & guards                | Labels/teams; middleware: `/seller`, `/admin`                             | Buyer blocked from admin                   | “Server-side checks, not UI-only.”                                          |
| **1.7**  | SCHEMA.md + collections       | All MVP collections + indexes + permission notes → `docs/agent/SCHEMA.md` | Document matches console                   | “Use Appwrite MCP; write docs/agent/SCHEMA.md; freeze field names.”         |
| **1.8**  | Storage buckets               | `avatars`, `product-images`, `bank-slips` (private), helpers              | Upload avatar works                        | “Validate mime/size; private slips.”                                        |
| **1.9**  | UI kit + shells               | Layouts for store/seller/admin + navbar                                   | Empty dashboards render                    | “shadcn MCP; consistent buttons/forms/tables.”                              |
| **1.10** | Shared types/enums            | Order/payment/product statuses exported                                   | Others can import                          | “Single source of truth; no string literals elsewhere.”                     |
| **1.11** | Thin services                 | e.g. `getProduct`, `getSessionUser`, upload helper                        | One example consumer                       | “API contracts others will call.”                                           |
| **1.12** | Seed script                   | Admin, seller, buyer, categories, sample product                          | One command seeds                          | “Document demo passwords in README only locally — not production secrets.”  |
| **1.13** | Done gate                     | Teammates can auth, open shells, upload, read products                    | Member 1 “done when”                       | Announce unblock to team                                                    |

**Phase 1 (after unblock, interleaved):** **1.14–1.21** shared infra (done). **Payment setup (Member 1):** **1.22** hash Function; **1.23** notify Function; **1.24** free confirm; **1.25** wire stub→live; **1.26** notify failure logging; **1.27** sandbox notes; **1.28** payment done gate.

### Member 1 — Definition of done

Others can: register/login → hit role shell → upload a file → list seeded `active` products.

**Payment setup (1.22–1.28):** others can complete **free** checkout via `confirmFreeOrder` (seeded `seed_demo_free_product`) and **PayHere sandbox** via `requestPayHereCheckout` + Member 2 UX, once Function merchant env + `PAYHERE_NOTIFY_URL` are set in the console. See [`PAYHERE.md`](./PAYHERE.md) consumer contract.

---

## 6. Member 2 — Buyer / storefront

### You are building

Discovery, cart, checkout UX (3 payment methods), buyer dashboard, orders, wishlist, reviews UI.

### Dependencies

- **Hard:** Member 1 Phase 0
- **For live PayHere / free paid:** Member 1 payment setup (1.22–1.28)
- Until then: implement checkout UX; stub PayHere button calling agreed Member 1 Function interface

### Step-by-step plan

| Step     | Goal             | Do                                                                                 | Verify                                      |
| -------- | ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| **2.1**  | Browse list      | Category list + product grid (`status=active` only)                                | Non-active never shown                      |
| **2.2**  | Filters & sort   | Price, category, sort by newest/price                                              | Query matches SCHEMA indexes                |
| **2.3**  | Product detail   | Images, description, seller info, reviews slot                                     | 404 for inactive                            |
| **2.4**  | Cart             | Add/update/remove; single-seller cart or warn on multi-seller                      | Persist for logged-in user                  |
| **2.5**  | Checkout shell   | Address form + method radio (payhere/bank/free)                                    | Validation errors clear                     |
| **2.6**  | Create order     | Create `orders` + `order_items` + `payments` row                                   | Ownership = current user                    |
| **2.7**  | Free path        | If all free / method free → mark paid via **Member 1** free-confirm API            | No PayHere; amount not client-trusted alone |
| **2.8**  | Bank path UX     | Show bank instructions from settings/seller; upload slip → `awaiting_verification` | File in private bucket                      |
| **2.9**  | PayHere UX       | Call **Member 1** hash Function; POST form to sandbox; return/cancel pages poll **DB** | No merchant secret in client                |
| **2.10** | Orders UI        | List + detail timeline                                                             | Cannot read others’ orders (IDOR test)      |
| **2.11** | Cancel           | Allowed only in early statuses                                                     | Rules match enums                           |
| **2.12** | Buyer dashboard  | Summaries + recent + wishlist preview                                              | Empty states OK                             |
| **2.13** | Wishlist         | Full page CRUD                                                                     | Own wishlist only                           |
| **2.14** | Reviews          | After `completed`; product + seller rating                                         | One review per order/product policy         |
| **2.15** | Report listing   | Creates `reports`                                                                  | Feeds admin queue                           |
| **2.16** | Optional Phase 5 | Trending, recently viewed, reorder                                                 | Only after MVP E2E                          |

### Member 2 — Agent sub-prompt example

```text
Member 2 Step 2.7 Free checkout only.
Create order+payment with method=free; confirm paid only via Member 1 free-confirm API.
Never trust client-sent amount. Tick WORK_DISTRIBUTION. Do not commit.
```

### Member 2 — Definition of done

Buyer completes **free**, **bank (pending verify)**, and **PayHere sandbox** (when Member 1 payment setup ready) flows; sees order history.

---

## 7. Member 3 — Seller portal

### You are building

Seller apply → wait for admin → shop + product CRUD + inventory + fulfill orders + earnings views.

### Dependencies

- Member 1 Phase 0
- Member 4 seller **approval** (you show pending/rejected/approved UI)
- Buyer orders from Member 2 for inbox data

### Step-by-step plan

| Step     | Goal                | Do                                                      | Verify                                  |
| -------- | ------------------- | ------------------------------------------------------- | --------------------------------------- |
| **3.1**  | Apply form          | Write `seller_profiles` status=`pending`                | Buyer can apply once                    |
| **3.2**  | Status screens      | Pending / rejected (reason) / approved gate             | `/seller` blocked if not approved       |
| **3.3**  | Shop profile        | Name, bio, banner; public `/shop/[slug]`                | Public read of approved shops only      |
| **3.4**  | Create product      | Draft product + images                                  | Own `sellerId` only                     |
| **3.5**  | Edit / archive      | Update fields; archive                                  | Cannot edit others’ products            |
| **3.6**  | Publish flow        | `draft` → `pending_review` or `active` per team policy  | Align with Member 4 moderation          |
| **3.7**  | Inventory           | Stock qty + availability toggle                         | Unavailable hides buy even if stock > 0 |
| **3.8**  | Free listing toggle | `price=0` / `isFree`                                    | Buyer free path works                   |
| **3.9**  | Dashboard KPIs      | Orders count, revenue, pending                          | Read-only aggregates own data           |
| **3.10** | Order inbox         | List seller’s orders                                    | Filter by sellerId                      |
| **3.11** | Fulfillment         | `processing` → `shipped`/`ready_pickup` → help complete | Invalid transitions rejected            |
| **3.12** | Bank details        | Account fields for buyer bank checkout                  | Not exposed beyond need                 |
| **3.13** | Earnings            | Paid orders list; payout manual note                    | Matches payments `paid`                 |
| **3.14** | Settings            | Return/shipping policy text                             | Public on shop/product                  |
| **3.15** | Optional            | Messaging / own bank verify (only if policy changes)    | Document in WORK_DISTRIBUTION           |

### Member 3 — Definition of done

Approved seller publishes listing; sees paid order; updates to shipped; earnings show paid totals.

---

## 8. Member 4 — Admin, moderation, trust

### You are building

Governance UI + bank slip verification **UI** + moderation + audit/reports. **Not** PayHere Functions (Member 1).

### Dependencies

- Member 1 Phase 0 (schema, admin shell, labels) + Member 1 payment setup for accurate statuses
- Integrates with Member 2 orders/payments and Member 3 seller applications/products

### Step-by-step plan

| Step     | Goal                    | Do                                                      | Verify                             |
| -------- | ----------------------- | ------------------------------------------------------- | ---------------------------------- |
| **4.1**  | Admin shell metrics     | Counts: users, sellers, orders, revenue                 | Admin-only                         |
| **4.2**  | Seller approval         | Approve → set label/team `seller`; reject + reason      | Audit log entry                    |
| **4.3**  | User management         | View, suspend; block checkout/publish when suspended    | Enforced server-side               |
| **4.4**  | Listing moderation      | Approve/reject/remove                                   | Status enums only                  |
| **4.5**  | Categories CRUD         | Create/update/order                                     | Storefront reads them              |
| **4.6**  | All orders + filters    | By payment method/status                                | Read-only + override later         |
| **4.7**  | Bank slip queue         | Approve → `paid` + stock rules; reject → failed/pending | Idempotent; audit                  |
| **4.8**  | Reports / disputes      | Triage listing reports + order disputes                 | Status workflow                    |
| **4.9**  | Platform settings UI    | Sandbox flag, bank copy, fee % (admin write)            | Buyer/seller read safe fields      |
| **4.10** | Audit viewer            | List admin actions                                      | Append-only                        |
| **4.11** | Analytics               | Basic sales + user growth                               | No PII leakage                     |
| **4.12** | Badges + fraud flags    | Verification badge; simple rule flags                   | Rules documented                   |
| **4.13** | Notify log viewer (opt) | Read-only UI over Member 1 failure logs                 | No secrets in UI                   |
| **4.14** | Optional Phase 5        | Featured listings, coupons                              | After E2E                          |

### Member 4 — Critical security steps (never skip)

- Admin actions audited
- Bank slip approve/reject idempotent
- Suspended users cannot checkout or publish
- Do **not** put PayHere merchant secret in admin UI or client

### Member 4 — Definition of done

Approve seller; verify bank slip; admin can suspend and take down listing. PayHere notify is Member 1’s responsibility.

---

## 9. Integration map (who waits on whom)

```text
Member 1 Phase 0 ──► unblock Members 2, 3, 4
Member 1 payment setup (1.22–1.28) ──► Member 2 live free + PayHere checkout
Member 4 seller approve ──► Member 3 can publish for real
Member 2 creates orders ──► Member 3 inbox + Member 4 oversight
Member 3 listings ──► Member 2 browse
Member 2/3 reports ──► Member 4 triage
```

### Weekly sync suggestion

| Week  | Focus                                 |
| ----- | ------------------------------------- |
| 1     | Member 1 Phase 0; others mock UI only |
| 1 end | Schema freeze + seed                  |
| 2–3   | Portals (2–4) + Member 1 payment setup |
| 3     | Payment E2E (free + bank + PayHere)   |
| 4     | Hardening + demo                      |

---

## 10. Cross-member E2E test script (Playwright MCP)

Run after Phase 4:

1. Register buyer · apply seller · admin approves seller
2. Seller creates paid + free products · admin approves if required
3. Buyer free checkout → `paid`
4. Buyer bank checkout → upload slip → admin approve → `paid`
5. Buyer PayHere sandbox → notify → `paid` (no double stock drop on replay)
6. Seller ships → buyer sees timeline
7. Suspended user cannot checkout

---

## 11. Quick “who owns what” cheat sheet

| Area                                                          | Member         |
| ------------------------------------------------------------- | -------------- |
| Auth, schema, UI kit, seeds, guards, **payment setup**        | **1**          |
| Browse, cart, checkout UX, buyer orders, wishlist, reviews UI | **2**          |
| Seller onboarding, products, inventory, fulfillment, shop     | **3**          |
| Admin, bank verify UI, moderation, audit                      | **4**          |
| Commits / PRs / merges                                        | **Human only** |

---

## 12. How to use this with your agent

1. Open Cursor in this repo.
2. Read `docs/agent/INDEX.md`, then attach `WORK_DISTRIBUTION.md` + this guide’s **your Member section**.
3. Say: “Implement Member {N} Step {X.Y} only; follow `.cursor/rules`; do not commit.”
4. After agent finishes, **you** commit.
5. Tick checkboxes in `WORK_DISTRIBUTION.md`.
6. Next step only when previous verify column passes.
