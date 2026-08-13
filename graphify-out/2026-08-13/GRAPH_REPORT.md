# Graph Report - knurdz-marketplace  (2026-08-12)

## Corpus Check
- 189 files · ~82,155 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1433 nodes · 3892 edges · 79 communities (67 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c117005e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- auth.ts
- platform-settings-admin.ts
- categories.ts
- cart.ts
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation-actions.ts
- admin-analytics.ts
- getLoggedInUser
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seller-approvals.ts
- checkout-form.tsx
- payhere-checkout-form.tsx
- compilerOptions
- orders/[id]/page.tsx
- createAdminClient
- wishlist.ts
- orders.ts
- Work Distribution — Knurdz Marketplace
- products.ts
- components.json
- admin/orders/page.tsx
- bank-slip-review.ts
- devDependencies
- seed-demo.mjs
- roles.ts
- portal-shell.tsx
- dependencies
- services/index.ts
- trust-signals.ts
- admin-orders.ts
- search/page.tsx
- Tables (17)
- cart-contents.tsx
- error-fallback.tsx
- seller-approval-actions.tsx
- admin-metrics.ts
- dashboard/page.tsx
- hasAppwritePublicConfig
- sellers.ts
- PayHere contract (Knurdz Marketplace)
- Trust rules (Knurdz Marketplace)
- verify-admin-analytics.mjs
- page-loader.tsx
- legal-page.tsx
- button.tsx
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- app/layout.tsx
- getCart
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- Agent reference docs
- devDependencies
- wishlist/page.tsx
- package.json
- shadcn
- AGENTS.md
- free-order.ts
- eslint.config.mjs
- Member 1 — Foundation (must-dos first)
- next.config.ts
- 3. Shared contracts (do not fork)
- postcss.config.mjs
- 7. Member 3 — Seller portal
- 2. Technical stack (detail)
- Member 3 — Seller portal
- Member 4 — Admin, moderation, trust
- class-variance-authority
- clsx
- node-appwrite
- shadcn
- tw-animate-css

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 94 edges
2. `createAdminClient()` - 75 edges
3. `createSessionClient()` - 65 edges
4. `hasAppwritePublicConfig()` - 61 edges
5. `Button()` - 42 edges
6. `cn()` - 31 edges
7. `DATABASE_ID` - 25 edges
8. `userHasLabel()` - 24 edges
9. `getOwnOrder()` - 24 edges
10. `requireLabel()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SellerApproveButton()` --indirect_call--> `approveSellerApplication()`  [INFERRED]
  components/admin/seller-approval-actions.tsx → lib/appwrite/seller-approval-actions.ts
- `SellerRejectForm()` --indirect_call--> `rejectSellerApplication()`  [INFERRED]
  components/admin/seller-approval-actions.tsx → lib/appwrite/seller-approval-actions.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (79 total, 12 thin omitted)

### Community 0 - "cn"
Cohesion: 0.22
Nodes (15): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+7 more)

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (56): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+48 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (46): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+38 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "cart.ts"
Cohesion: 0.11
Nodes (32): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar(), TABLE_CART_ITEMS, TABLE_CARTS, addToCart() (+24 more)

### Community 5 - "types/index.ts"
Cohesion: 0.09
Nodes (41): Cart, CartItem, CartLine, CartLineIssue, OrderItem, Review, WishlistItem, WishlistLineIssue (+33 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation-actions.ts"
Cohesion: 0.22
Nodes (17): initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm(), ListingRowActions(), ListingRowActionsProps, useModerationToast() (+9 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "getLoggedInUser"
Cohesion: 0.05
Nodes (87): RouteParams, AccountPage(), LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage() (+79 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.12
Nodes (16): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path), 9. Integration map (who waits on whom), Blocker rule (+8 more)

### Community 11 - "seller-approvals.ts"
Cohesion: 0.16
Nodes (20): ROLE_LABELS, approveSellerApplication(), assertAdmin(), rejectSellerApplication(), revalidateSellerPaths(), AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore() (+12 more)

### Community 12 - "checkout-form.tsx"
Cohesion: 0.15
Nodes (14): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, CheckoutFormProps, initialState, METHOD_LABELS, ProductCatalogFiltersProps, SORT_OPTIONS (+6 more)

### Community 13 - "payhere-checkout-form.tsx"
Cohesion: 0.18
Nodes (12): FreeOrderConfirmFormProps, initialState, PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), ConfirmFreeOrderActionState, mapExecutionError(), normalizePayHereOrderId() (+4 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "orders/[id]/page.tsx"
Cohesion: 0.20
Nodes (14): OrderDetailPage(), OrderDetailPageProps, OrdersPage(), OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus() (+6 more)

### Community 16 - "createAdminClient"
Cohesion: 0.21
Nodes (16): TABLE_PRODUCTS, createAdminClient(), deleteFileAsAdmin(), ACTIVE_STATUS, adminSdkAvailable(), approveListingCore(), ARCHIVED_STATUS, ListingModerationResult (+8 more)

### Community 17 - "wishlist.ts"
Cohesion: 0.19
Nodes (21): TABLE_WISHLIST_ITEMS, addToWishlist(), removeFromWishlist(), revalidateWishlistPaths(), addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem() (+13 more)

### Community 18 - "orders.ts"
Cohesion: 0.11
Nodes (30): CheckoutForm(), OrderCancelForm(), cancelOrderAction(), createOrder(), revalidateCheckoutPaths(), revalidateOrderPaths(), CancelOrderActionState, CancelOrderResult (+22 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.15
Nodes (13): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Principles, Risks (track while implementing), Shared post-implementation checklist (all members) (+5 more)

### Community 20 - "products.ts"
Cohesion: 0.22
Nodes (14): TABLE_PRODUCT_IMAGES, planStockDecrements(), asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage(), buildProductCatalogQueries() (+6 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "admin/orders/page.tsx"
Cohesion: 0.29
Nodes (11): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+3 more)

### Community 23 - "bank-slip-review.ts"
Cohesion: 0.09
Nodes (38): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, GET(), BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm() (+30 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "roles.ts"
Cohesion: 0.06
Nodes (57): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, ADMIN_NAV, AdminLayout(), AdminUsersPage() (+49 more)

### Community 27 - "portal-shell.tsx"
Cohesion: 0.18
Nodes (14): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButtonProps, Sheet(), SheetContent(), SheetDescription() (+6 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, lucide-react, next, dependencies, appwrite, lucide-react, next, radix-ui (+11 more)

### Community 29 - "services/index.ts"
Cohesion: 0.20
Nodes (13): UploadValidationError, UploadValidationOk, UploadValidationResult, createProductReport(), REPORT_ERROR_CODES, ReportActionState, ReportErrorCode, createProductReview() (+5 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (58): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+50 more)

### Community 31 - "admin-orders.ts"
Cohesion: 0.22
Nodes (19): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), ListAllOrdersResult (+11 more)

### Community 32 - "search/page.tsx"
Cohesion: 0.18
Nodes (17): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductList() (+9 more)

### Community 33 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 34 - "cart-contents.tsx"
Cohesion: 0.28
Nodes (12): AddToCartButton(), AddToCartButtonProps, CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), addToCart(), clearCart() (+4 more)

### Community 36 - "seller-approval-actions.tsx"
Cohesion: 0.23
Nodes (11): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+3 more)

### Community 37 - "admin-metrics.ts"
Cohesion: 0.23
Nodes (14): AdminPage(), formatCount(), formatRevenue(), TABLE_ORDERS, TABLE_PAYMENTS, AdminMetrics, asNullableString(), asNumber() (+6 more)

### Community 38 - "dashboard/page.tsx"
Cohesion: 0.19
Nodes (11): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), PayHerePaymentStatus() (+3 more)

### Community 39 - "hasAppwritePublicConfig"
Cohesion: 0.20
Nodes (22): ProductPage(), hasAppwritePublicConfig(), createPublicClient(), listOwnOrders(), getProduct(), asNullableString(), asNumber(), asRating() (+14 more)

### Community 40 - "sellers.ts"
Cohesion: 0.19
Nodes (14): AdminListingsPage(), formatPrice(), PageProps, SellerInfoCard(), SellerInfoCardProps, TABLE_SELLER_PROFILES, listPendingModerationQueue(), listProductsByStatus() (+6 more)

### Community 41 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 42 - "Trust rules (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (11): Data sources (read-only), Fraud / risk flags, Future: manual Verified override, List scan limits, `new_seller_high_first_order`, No persisted state, `open_unresolved_reports`, `rapid_cancellation_rate` (+3 more)

### Community 43 - "verify-admin-analytics.mjs"
Cohesion: 0.22
Nodes (8): emptySales, generateBucketKeys(), keys12, keys30, r12, r30, toDayBucket(), toMonthBucket()

### Community 45 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 46 - "button.tsx"
Cohesion: 0.18
Nodes (11): ProductPageProps, initialState, OrderCancelFormProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, ReportListingButton(), WishlistToggleButton(), WishlistToggleButtonProps (+3 more)

### Community 47 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 48 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 49 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 50 - "verify-user-suspend.mjs"
Cohesion: 0.47
Nodes (8): adminClient(), assert(), countAuditEvents(), findUserByEmail(), main(), requireEnv(), sessionGet(), tryLogin()

### Community 51 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 52 - "getCart"
Cohesion: 0.47
Nodes (4): CartPage(), CheckoutPage(), CartContents(), getCart()

### Community 54 - "6. Member 2 — Buyer / storefront"
Cohesion: 0.33
Nodes (6): 6. Member 2 — Buyer / storefront, Dependencies, Member 2 — Agent sub-prompt example, Member 2 — Definition of done, Step-by-step plan, You are building

### Community 55 - "8. Member 4 — Admin, moderation, trust"
Cohesion: 0.33
Nodes (6): 8. Member 4 — Admin, moderation, trust, Dependencies, Member 4 — Critical security steps (never skip), Member 4 — Definition of done, Step-by-step plan, You are building

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "wishlist/page.tsx"
Cohesion: 0.24
Nodes (9): WishlistPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, listProductImages(), getOwnWishlistView() (+1 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "free-order.ts"
Cohesion: 0.40
Nodes (5): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, ConfirmFreeOrderRequest, ConfirmFreeOrderResult

### Community 65 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 67 - "3. Shared contracts (do not fork)"
Cohesion: 0.40
Nodes (5): 3. Shared contracts (do not fork), Agent rules every step, Minimum collections (Member 1 creates), Ownership of payments, Status enums

### Community 69 - "7. Member 3 — Seller portal"
Cohesion: 0.40
Nodes (5): 7. Member 3 — Seller portal, Dependencies, Member 3 — Definition of done, Step-by-step plan, You are building

### Community 70 - "2. Technical stack (detail)"
Cohesion: 0.50
Nodes (4): 2. Technical stack (detail), Approved MCPs (agents), Suggested env (Member 1 defines `.env.example`), Suggested folder layout (Member 1 establishes; others follow)

### Community 71 - "Member 3 — Seller portal"
Cohesion: 0.50
Nodes (4): Member 3 — Seller portal, Member 3 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 72 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

## Knowledge Gaps
- **370 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `cart.ts`, `types/index.ts`, `listing-moderation-actions.ts`, `seller-approvals.ts`, `payhere-checkout-form.tsx`, `orders/[id]/page.tsx`, `wishlist.ts`, `orders.ts`, `bank-slip-review.ts`, `roles.ts`, `dashboard/page.tsx`, `hasAppwritePublicConfig`, `button.tsx`, `getCart`, `wishlist/page.tsx`, `free-order.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `search/page.tsx`, `cn`, `platform-settings-admin.ts`, `categories.ts`, `wishlist/page.tsx`, `seller-approval-actions.tsx`, `dashboard/page.tsx`, `listing-moderation-actions.ts`, `cart-contents.tsx`, `error-fallback.tsx`, `checkout-form.tsx`, `payhere-checkout-form.tsx`, `orders/[id]/page.tsx`, `getCart`, `admin/orders/page.tsx`, `bank-slip-review.ts`, `roles.ts`, `portal-shell.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `seller-approval-actions.tsx`, `admin-metrics.ts`, `admin-analytics.ts`, `getLoggedInUser`, `sellers.ts`, `seller-approvals.ts`, `products.ts`, `bank-slip-review.ts`, `roles.ts`, `trust-signals.ts`, `admin-orders.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _370 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059076682316118935 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07619738751814223 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09351432880844646 - nodes in this community are weakly interconnected._