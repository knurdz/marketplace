# Graph Report - knurdz-marketplace  (2026-08-12)

## Corpus Check
- 163 files · ~64,526 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1141 nodes · 2999 edges · 56 communities (46 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59853000`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types/index.ts
- seller-approvals.ts
- auth.ts
- hasAppwritePublicConfig
- createAdminClient
- services/index.ts
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- checkout-form.tsx
- compilerOptions
- Tables (17)
- appwrite/index.ts
- portal-shell.tsx
- orders.ts
- products.ts
- orders/[id]/page.tsx
- components.json
- dependencies
- cn
- devDependencies
- reviews.ts
- seed-demo.mjs
- types/payhere.ts
- (store)/layout.tsx
- Work Distribution — Knurdz Marketplace
- categories.ts
- getLoggedInUser
- Member 3 — Seller portal
- Member 4 — Admin, moderation, trust
- button.tsx
- clsx
- PayHere contract (Knurdz Marketplace)
- react-dom
- page-loader.tsx
- legal-page.tsx
- search/page.tsx
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- sonner
- app/layout.tsx
- Notify Function
- Hash Function
- Member 1 — Foundation (must-dos first)
- Agent reference docs
- devDependencies
- package.json
- shadcn
- AGENTS.md
- eslint.config.mjs
- tailwind-merge
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 84 edges
2. `createSessionClient()` - 54 edges
3. `hasAppwritePublicConfig()` - 46 edges
4. `createAdminClient()` - 40 edges
5. `Button()` - 36 edges
6. `cn()` - 29 edges
7. `getOwnOrder()` - 24 edges
8. `assertRateLimit()` - 21 edges
9. `getOwnPaymentForOrder()` - 21 edges
10. `getProduct()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `ResendVerificationForm()` --indirect_call--> `requestEmailVerification()`  [INFERRED]
  components/auth/resend-verification-form.tsx → lib/appwrite/recovery.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (56 total, 10 thin omitted)

### Community 0 - "types/index.ts"
Cohesion: 0.11
Nodes (34): BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, Product, Report (+26 more)

### Community 1 - "seller-approvals.ts"
Cohesion: 0.05
Nodes (66): ADMIN_NAV, AdminLayout(), AdminSellersPage(), formatAppliedAt(), AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps (+58 more)

### Community 2 - "auth.ts"
Cohesion: 0.06
Nodes (57): LoginPage(), safeNextPath(), RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState (+49 more)

### Community 3 - "hasAppwritePublicConfig"
Cohesion: 0.08
Nodes (45): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), ProductPage() (+37 more)

### Community 4 - "createAdminClient"
Cohesion: 0.07
Nodes (54): AdminListingsPage(), formatPrice(), PageProps, AdminPage(), formatCount(), formatRevenue(), initial, ListingApproveButton() (+46 more)

### Community 5 - "services/index.ts"
Cohesion: 0.08
Nodes (63): CartPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+55 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 8 - "checkout-form.tsx"
Cohesion: 0.13
Nodes (14): BankSlipUploadFormProps, initialState, CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmFormProps, initialState, PayHereCheckoutForm() (+6 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 10 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 11 - "appwrite/index.ts"
Cohesion: 0.06
Nodes (74): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), initialState, ResendVerificationForm(), ProductImageGallery() (+66 more)

### Community 12 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 13 - "orders.ts"
Cohesion: 0.09
Nodes (41): BankSlipUploadForm(), CheckoutForm(), OrderCancelForm(), cancelOrderAction(), createOrder(), revalidateCheckoutPaths(), revalidateOrderPaths(), submitBankSlipAction() (+33 more)

### Community 14 - "products.ts"
Cohesion: 0.17
Nodes (21): CategoryPage(), Home(), SearchPage(), asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage() (+13 more)

### Community 15 - "orders/[id]/page.tsx"
Cohesion: 0.18
Nodes (16): OrderDetailPage(), OrderDetailPageProps, OrdersPage(), OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus() (+8 more)

### Community 16 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 17 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 18 - "cn"
Cohesion: 0.22
Nodes (15): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+7 more)

### Community 19 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 20 - "reviews.ts"
Cohesion: 0.12
Nodes (24): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, createProductReview(), revalidateReviewPaths(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString() (+16 more)

### Community 21 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 22 - "types/payhere.ts"
Cohesion: 0.11
Nodes (23): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+15 more)

### Community 23 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 24 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.15
Nodes (13): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Principles, Risks (track while implementing), Shared post-implementation checklist (all members) (+5 more)

### Community 25 - "categories.ts"
Cohesion: 0.36
Nodes (7): CategoriesPage(), asCategory(), asNullableString(), asNumber(), getCategoryBySlug(), listCategories(), Category

### Community 26 - "getLoggedInUser"
Cohesion: 0.13
Nodes (26): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps (+18 more)

### Community 27 - "Member 3 — Seller portal"
Cohesion: 0.50
Nodes (4): Member 3 — Seller portal, Member 3 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 28 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 29 - "button.tsx"
Cohesion: 0.15
Nodes (6): initialState, OrderCancelFormProps, Button(), buttonVariants, ErrorFallback(), ErrorFallbackProps

### Community 31 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 34 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 35 - "search/page.tsx"
Cohesion: 0.24
Nodes (9): CategoryPageProps, HomeProps, SearchPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS, ProductList(), ProductListProps (+1 more)

### Community 36 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 37 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 38 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 39 - "verify-user-suspend.mjs"
Cohesion: 0.47
Nodes (8): adminClient(), assert(), countAuditEvents(), findUserByEmail(), main(), requireEnv(), sessionGet(), tryLogin()

### Community 41 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 43 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 44 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 45 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 46 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 47 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 48 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **316 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `seller-approvals.ts`, `auth.ts`, `hasAppwritePublicConfig`, `createAdminClient`, `services/index.ts`, `appwrite/index.ts`, `orders.ts`, `orders/[id]/page.tsx`, `reviews.ts`, `types/payhere.ts`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `seller-approvals.ts`, `search/page.tsx`, `hasAppwritePublicConfig`, `services/index.ts`, `createAdminClient`, `checkout-form.tsx`, `portal-shell.tsx`, `orders/[id]/page.tsx`, `cn`, `reviews.ts`, `categories.ts`, `getLoggedInUser`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `seller-approvals.ts`, `auth.ts`, `appwrite/index.ts`, `services/index.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _316 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11411411411411411 - nodes in this community are weakly interconnected._
- **Should `seller-approvals.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05837837837837838 - nodes in this community are weakly interconnected._