# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 142 files · ~54,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 971 nodes · 2444 edges · 53 communities (42 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c34f8143`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- types/payhere.ts
- auth.ts
- types/index.ts
- products.ts
- PayHere contract (Knurdz Marketplace)
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- devDependencies
- dependencies
- compilerOptions
- Tables (17)
- Work Distribution — Knurdz Marketplace
- components.json
- seed-demo.mjs
- button.tsx
- services/index.ts
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- scripts
- getLoggedInUser
- shadcn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- package.json
- devDependencies
- orders.ts
- react-dom
- sonner
- tailwind-merge
- isPaymentMethod
- dashboard/page.tsx
- order-actions.ts
- Notify Function
- wishlist-list.tsx
- orders/[id]/page.tsx
- Hash Function
- Member 1 — Foundation (must-dos first)
- Member 3 — Seller portal
- bank/page.tsx
- lucide-react
- cn
- free-order.ts
- Member 4 — Admin, moderation, trust
- orders/page.tsx
- Knurdz Marketplace
- Agent reference docs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 73 edges
2. `createSessionClient()` - 50 edges
3. `hasAppwritePublicConfig()` - 31 edges
4. `Button()` - 30 edges
5. `cn()` - 29 edges
6. `getOwnOrder()` - 24 edges
7. `getOwnPaymentForOrder()` - 21 edges
8. `Tables (17)` - 18 edges
9. `createAdminClient()` - 17 edges
10. `assertRateLimit()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `CheckoutForm()` --indirect_call--> `createOrder()`  [INFERRED]
  components/store/checkout-form.tsx → lib/services/order-actions.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `CartPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(store)/cart/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (53 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.06
Nodes (79): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount() (+71 more)

### Community 1 - "types/payhere.ts"
Cohesion: 0.12
Nodes (23): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), FIELD_KEYS, FUNCTION_PAYHERE_CHECKOUT_HASH (+15 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (45): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+37 more)

### Community 3 - "types/index.ts"
Cohesion: 0.11
Nodes (34): BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, Payment, Report (+26 more)

### Community 4 - "products.ts"
Cohesion: 0.10
Nodes (34): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps (+26 more)

### Community 5 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, clsx, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.15
Nodes (13): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Principles, Risks (track while implementing), Shared post-implementation checklist (all members) (+5 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 15 - "button.tsx"
Cohesion: 0.08
Nodes (20): CartPage(), CheckoutPage(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), CheckoutForm() (+12 more)

### Community 16 - "services/index.ts"
Cohesion: 0.05
Nodes (90): CategoriesPage(), ProductPage(), ProductPageProps, WishlistPage(), AddToCartButton(), AddToCartButtonProps, ProductReviewsPlaceholder(), SellerInfoCard() (+82 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 21 - "getLoggedInUser"
Cohesion: 0.19
Nodes (19): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps (+11 more)

### Community 29 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 30 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 31 - "orders.ts"
Cohesion: 0.16
Nodes (20): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+12 more)

### Community 35 - "isPaymentMethod"
Cohesion: 0.23
Nodes (13): asBankSlip(), asNullableString(), asNumber(), asOrder(), asOrderItem(), asPayment(), isBankSlipStatus(), isOneOf() (+5 more)

### Community 36 - "dashboard/page.tsx"
Cohesion: 0.32
Nodes (7): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel()

### Community 37 - "order-actions.ts"
Cohesion: 0.14
Nodes (20): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, initialState, OrderCancelForm() (+12 more)

### Community 38 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 39 - "wishlist-list.tsx"
Cohesion: 0.67
Nodes (3): issueLabel(), WishlistList(), WishlistListProps

### Community 40 - "orders/[id]/page.tsx"
Cohesion: 0.23
Nodes (13): OrderDetailPage(), OrderDetailPageProps, OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod() (+5 more)

### Community 41 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 42 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 43 - "Member 3 — Seller portal"
Cohesion: 0.50
Nodes (4): Member 3 — Seller portal, Member 3 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 44 - "bank/page.tsx"
Cohesion: 0.40
Nodes (4): CheckoutContinuationPageProps, ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

### Community 46 - "cn"
Cohesion: 0.06
Nodes (50): ADMIN_NAV, AdminLayout(), jetbrainsMono, metadata, RootLayout(), spaceGrotesk, SELLER_NAV, SellerLayout() (+42 more)

### Community 47 - "free-order.ts"
Cohesion: 0.40
Nodes (5): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, ConfirmFreeOrderRequest, ConfirmFreeOrderResult

### Community 48 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 51 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 58 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

## Knowledge Gaps
- **294 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `types/payhere.ts`, `auth.ts`, `dashboard/page.tsx`, `orders/[id]/page.tsx`, `bank/page.tsx`, `cn`, `button.tsx`, `services/index.ts`, `orders/page.tsx`, `free-order.ts`, `orders.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `types/payhere.ts`, `products.ts`, `dashboard/page.tsx`, `order-actions.ts`, `orders/[id]/page.tsx`, `cn`, `services/index.ts`, `orders/page.tsx`, `getLoggedInUser`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `appwrite/index.ts` to `types/payhere.ts`, `auth.ts`, `orders/[id]/page.tsx`, `cn`, `services/index.ts`, `orders/page.tsx`, `getLoggedInUser`, `orders.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06017252261729434 - nodes in this community are weakly interconnected._
- **Should `types/payhere.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07231638418079096 - nodes in this community are weakly interconnected._