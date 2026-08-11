# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 146 files · ~56,116 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1008 nodes · 2562 edges · 46 communities (35 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6b73a38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- services/index.ts
- setup-mvp-schema.mjs
- auth.ts
- devDependencies
- compilerOptions
- dependencies
- button.tsx
- types/payhere.ts
- Tables (17)
- components.json
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seed-demo.mjs
- Work Distribution — Knurdz Marketplace
- wishlist.ts
- Knurdz Marketplace
- PayHere contract (Knurdz Marketplace)
- error-fallback.tsx
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- devDependencies
- AGENTS.md
- cart.ts
- orders.ts
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- isPaymentMethod
- types/index.ts
- Notify Function
- Hash Function
- seller-approvals.ts
- shadcn
- Agent reference docs
- products.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- order-display.ts
- clsx
- scripts
- free-order.ts
- package.json
- react-dom
- sonner
- tailwind-merge

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 73 edges
2. `createSessionClient()` - 50 edges
3. `hasAppwritePublicConfig()` - 35 edges
4. `Button()` - 30 edges
5. `cn()` - 29 edges
6. `createAdminClient()` - 27 edges
7. `getOwnOrder()` - 24 edges
8. `getOwnPaymentForOrder()` - 21 edges
9. `Tables (17)` - 18 edges
10. `assertRateLimit()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `CategoryPage()` --calls--> `getCategoryBySlug()`  [EXTRACTED]
  app/(store)/categories/[slug]/page.tsx → lib/services/categories.ts
- `CategoriesPage()` --calls--> `listCategories()`  [EXTRACTED]
  app/(store)/categories/page.tsx → lib/services/categories.ts

## Import Cycles
- None detected.

## Communities (46 total, 11 thin omitted)

### Community 0 - "services/index.ts"
Cohesion: 0.05
Nodes (88): AccountPage(), CategoriesPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps (+80 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (46): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+38 more)

### Community 3 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 6 - "button.tsx"
Cohesion: 0.05
Nodes (58): ADMIN_NAV, AdminLayout(), jetbrainsMono, metadata, RootLayout(), spaceGrotesk, SELLER_NAV, SellerLayout() (+50 more)

### Community 7 - "types/payhere.ts"
Cohesion: 0.11
Nodes (24): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), Order, FIELD_KEYS (+16 more)

### Community 8 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.07
Nodes (27): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+19 more)

### Community 13 - "wishlist.ts"
Cohesion: 0.10
Nodes (37): ProductPage(), ProductPageProps, WishlistPage(), ProductReviewsPlaceholder(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton() (+29 more)

### Community 14 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 15 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 22 - "cart.ts"
Cohesion: 0.13
Nodes (39): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+31 more)

### Community 23 - "orders.ts"
Cohesion: 0.05
Nodes (76): LoginPage(), safeNextPath(), CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage() (+68 more)

### Community 24 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 25 - "isPaymentMethod"
Cohesion: 0.23
Nodes (13): asBankSlip(), asNullableString(), asNumber(), asOrder(), asOrderItem(), asPayment(), isBankSlipStatus(), isOneOf() (+5 more)

### Community 26 - "types/index.ts"
Cohesion: 0.13
Nodes (30): BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, Report, WishlistItem (+22 more)

### Community 28 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 29 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 30 - "seller-approvals.ts"
Cohesion: 0.06
Nodes (57): AdminPage(), formatCount(), formatRevenue(), AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps (+49 more)

### Community 32 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 33 - "products.ts"
Cohesion: 0.11
Nodes (31): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductList() (+23 more)

### Community 38 - "order-display.ts"
Cohesion: 0.26
Nodes (10): OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod(), ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS (+2 more)

### Community 40 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 42 - "free-order.ts"
Cohesion: 0.40
Nodes (4): normalizeOrderId(), NOT_CONFIGURED, ConfirmFreeOrderRequest, ConfirmFreeOrderResult

### Community 45 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **297 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `orders.ts` to `services/index.ts`, `products.ts`, `auth.ts`, `button.tsx`, `types/payhere.ts`, `free-order.ts`, `wishlist.ts`, `cart.ts`, `seller-approvals.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `services/index.ts`, `products.ts`, `types/payhere.ts`, `wishlist.ts`, `error-fallback.tsx`, `cart.ts`, `orders.ts`, `seller-approvals.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _297 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `services/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05257985257985258 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07049180327868852 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._