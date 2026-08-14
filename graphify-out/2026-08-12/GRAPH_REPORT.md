# Graph Report - .  (2026-08-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1194 nodes · 3192 edges · 57 communities (48 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1279145`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- getLoggedInUser
- seller-approvals.ts
- auth.ts
- createAdminClient
- categories.ts
- createSessionClient
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- admin-orders.ts
- compilerOptions
- products.ts
- types/payhere.ts
- status.ts
- portal-shell.tsx
- cn
- Work Distribution — Knurdz Marketplace
- components.json
- reviews.ts
- dependencies
- devDependencies
- wishlist.ts
- seed-demo.mjs
- types/index.ts
- button.tsx
- Tables (17)
- products/[id]/page.tsx
- toast.ts
- error-fallback.tsx
- PayHere contract (Knurdz Marketplace)
- page-loader.tsx
- (store)/layout.tsx
- legal-page.tsx
- order-display.ts
- services/index.ts
- Knurdz Marketplace
- setup-storage-buckets.mjs
- dashboard/page.tsx
- scripts
- verify-user-suspend.mjs
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- app/layout.tsx
- Notify Function
- Hash Function
- free-order.ts
- Agent reference docs
- devDependencies
- package.json
- shadcn
- AGENTS.md
- eslint.config.mjs
- lucide-react
- next
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 86 edges
2. `createSessionClient()` - 61 edges
3. `hasAppwritePublicConfig()` - 50 edges
4. `createAdminClient()` - 47 edges
5. `Button()` - 38 edges
6. `cn()` - 29 edges
7. `getOwnOrder()` - 24 edges
8. `assertRateLimit()` - 21 edges
9. `getOwnPaymentForOrder()` - 21 edges
10. `createPublicClient()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (57 total, 9 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.05
Nodes (84): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount() (+76 more)

### Community 1 - "getLoggedInUser"
Cohesion: 0.05
Nodes (80): LoginPage(), safeNextPath(), CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage() (+72 more)

### Community 2 - "seller-approvals.ts"
Cohesion: 0.05
Nodes (65): ADMIN_NAV, AdminLayout(), AdminSellersPage(), formatAppliedAt(), AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps (+57 more)

### Community 3 - "auth.ts"
Cohesion: 0.06
Nodes (57): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+49 more)

### Community 4 - "createAdminClient"
Cohesion: 0.07
Nodes (54): AdminListingsPage(), formatPrice(), PageProps, AdminPage(), formatCount(), formatRevenue(), initial, ListingApproveButton() (+46 more)

### Community 5 - "categories.ts"
Cohesion: 0.10
Nodes (45): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+37 more)

### Community 6 - "createSessionClient"
Cohesion: 0.12
Nodes (40): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+32 more)

### Community 7 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 8 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.07
Nodes (34): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+26 more)

### Community 9 - "admin-orders.ts"
Cohesion: 0.14
Nodes (27): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+19 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "products.ts"
Cohesion: 0.16
Nodes (23): CategoryPage(), SearchPage(), asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage(), buildProductCatalogQueries() (+15 more)

### Community 12 - "types/payhere.ts"
Cohesion: 0.13
Nodes (21): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), FIELD_KEYS, isNonEmptyString() (+13 more)

### Community 13 - "status.ts"
Cohesion: 0.11
Nodes (23): ACTIVE_PRODUCT_STATUS, BANK_SLIP_STATUSES, HAPPY_PATH, isBankSlipStatus(), isOneOf(), isOrderStatus(), isPaymentMethod(), isPaymentStatus() (+15 more)

### Community 14 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 15 - "cn"
Cohesion: 0.20
Nodes (16): formatRelative(), NotificationBell(), Badge(), badgeVariants, Label(), Popover(), PopoverContent(), PopoverDescription() (+8 more)

### Community 16 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.10
Nodes (23): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+15 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "reviews.ts"
Cohesion: 0.18
Nodes (19): REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString(), asNumber(), asRating(), asReview(), assertReviewMutationRateLimit() (+11 more)

### Community 19 - "dependencies"
Cohesion: 0.10
Nodes (21): appwrite, class-variance-authority, clsx, node-appwrite, dependencies, appwrite, class-variance-authority, clsx (+13 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 21 - "wishlist.ts"
Cohesion: 0.22
Nodes (18): TABLE_WISHLIST_ITEMS, addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine(), WISHLIST_ERROR_CODES, WishlistActionState (+10 more)

### Community 22 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 23 - "types/index.ts"
Cohesion: 0.19
Nodes (18): BankSlip, Cart, CartItem, CartLine, CartLineIssue, Category, OrderItem, Report (+10 more)

### Community 24 - "button.tsx"
Cohesion: 0.22
Nodes (11): CategoryPageProps, HomeProps, SearchPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS, ProductList(), ProductListProps (+3 more)

### Community 25 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 26 - "products/[id]/page.tsx"
Cohesion: 0.16
Nodes (12): ProductPage(), ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, WishlistToggleButton(), WishlistToggleButtonProps, createProductReview(), revalidateReviewPaths() (+4 more)

### Community 27 - "toast.ts"
Cohesion: 0.20
Nodes (10): WishlistPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, addToWishlist(), removeFromWishlist() (+2 more)

### Community 29 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 31 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 32 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 33 - "order-display.ts"
Cohesion: 0.29
Nodes (8): OrderTimeline(), OrderTimelineProps, formatOrderStatus(), ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, deriveOrderTimeline(), OrderStatus, PaymentMethod

### Community 34 - "services/index.ts"
Cohesion: 0.49
Nodes (8): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables(), PlatformSetting

### Community 35 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 36 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 37 - "dashboard/page.tsx"
Cohesion: 0.28
Nodes (8): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), Order

### Community 38 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 39 - "verify-user-suspend.mjs"
Cohesion: 0.47
Nodes (8): adminClient(), assert(), countAuditEvents(), findUserByEmail(), main(), requireEnv(), sessionGet(), tryLogin()

### Community 40 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 41 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 43 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 44 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 45 - "free-order.ts"
Cohesion: 0.40
Nodes (5): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, ConfirmFreeOrderRequest, ConfirmFreeOrderResult

### Community 46 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 47 - "devDependencies"
Cohesion: 0.40
Nodes (4): devDependencies, shadcn, shadcn, shadcn

### Community 48 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **303 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `SearchPageProps` (+298 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `seller-approvals.ts`, `auth.ts`, `createAdminClient`, `dashboard/page.tsx`, `categories.ts`, `createSessionClient`, `types/payhere.ts`, `free-order.ts`, `reviews.ts`, `wishlist.ts`, `products/[id]/page.tsx`, `toast.ts`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `getLoggedInUser`, `seller-approvals.ts`, `createAdminClient`, `dashboard/page.tsx`, `categories.ts`, `createSessionClient`, `admin-orders.ts`, `types/payhere.ts`, `portal-shell.tsx`, `cn`, `products/[id]/page.tsx`, `toast.ts`, `error-fallback.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `createSessionClient` to `appwrite/index.ts`, `getLoggedInUser`, `services/index.ts`, `auth.ts`, `categories.ts`, `types/payhere.ts`, `portal-shell.tsx`, `reviews.ts`, `wishlist.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _303 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05273177232057872 - nodes in this community are weakly interconnected._
- **Should `getLoggedInUser` be split into smaller, more focused modules?**
  _Cohesion score 0.05086390992040381 - nodes in this community are weakly interconnected._
- **Should `seller-approvals.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05368421052631579 - nodes in this community are weakly interconnected._