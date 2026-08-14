# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 216 files · ~94,208 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1662 nodes · 4526 edges · 80 communities (69 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44f5699b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- store-navbar.tsx
- reports.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- services/index.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- checkout-form.tsx
- free-order.ts
- compilerOptions
- dashboard/page.tsx
- seller-application.ts
- products.ts
- order-actions.ts
- Work Distribution — Knurdz Marketplace
- verify-payhere-notify.ts
- components.json
- hasAppwritePublicConfig
- bank-slip-review.ts
- devDependencies
- seed-demo.mjs
- createAdminClient
- user-management.ts
- dependencies
- createPublicClient
- trust-signals.ts
- notification-bell.tsx
- userHasLabel
- Tables (17)
- orders.ts
- button.tsx
- seller-approvals.ts
- cn
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- wishlist.ts
- admin-orders.ts
- PayHere contract (Knurdz Marketplace)
- Trust rules (Knurdz Marketplace)
- verify-admin-analytics.mjs
- page-loader.tsx
- legal-page.tsx
- Notify Function
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- Hash Function
- getLoggedInUser
- product-reviews-placeholder.tsx
- wishlist-list.tsx
- Agent reference docs
- devDependencies
- products/[id]/page.tsx
- package.json
- shadcn
- AGENTS.md
- shop-profile-form.tsx
- eslint.config.mjs
- Member 1 — Foundation (must-dos first)
- next.config.ts
- payhere-checkout-hash/package.json
- postcss.config.mjs
- payhere-notify/package.json
- verify-seller-status-gate.ts
- (store)/layout.tsx
- Member 4 — Admin, moderation, trust
- class-variance-authority
- node-appwrite
- app/layout.tsx
- shadcn
- react
- tw-animate-css

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 103 edges
2. `createAdminClient()` - 91 edges
3. `hasAppwritePublicConfig()` - 70 edges
4. `createSessionClient()` - 70 edges
5. `Button()` - 45 edges
6. `userHasLabel()` - 32 edges
7. `cn()` - 31 edges
8. `DATABASE_ID` - 28 edges
9. `getOwnOrder()` - 26 edges
10. `requireLabel()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `NavLinks()` --calls--> `userHasLabel()`  [EXTRACTED]
  components/layout/store-navbar.tsx → lib/appwrite/roles.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (80 total, 11 thin omitted)

### Community 0 - "store-navbar.tsx"
Cohesion: 0.17
Nodes (14): NavLinks(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter() (+6 more)

### Community 1 - "reports.ts"
Cohesion: 0.06
Nodes (57): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+49 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (46): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+38 more)

### Community 3 - "categories.ts"
Cohesion: 0.10
Nodes (45): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+37 more)

### Community 4 - "createSessionClient"
Cohesion: 0.13
Nodes (39): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+31 more)

### Community 5 - "types/index.ts"
Cohesion: 0.07
Nodes (56): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), PayHerePaymentStatusProps, mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), AuditLogEntry (+48 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.07
Nodes (47): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+39 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "services/index.ts"
Cohesion: 0.05
Nodes (85): AdminPage(), formatCount(), formatRevenue(), AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts() (+77 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.10
Nodes (35): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper(), objectHasSecretKey() (+27 more)

### Community 12 - "checkout-form.tsx"
Cohesion: 0.20
Nodes (9): CheckoutFormProps, initialState, METHOD_LABELS, ProductCatalogFiltersProps, SORT_OPTIONS, Label(), ProductCatalogParams, CartView (+1 more)

### Community 13 - "free-order.ts"
Cohesion: 0.10
Nodes (30): adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder(), normalizeOrderId() (+22 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.12
Nodes (22): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrderDetailPage() (+14 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.15
Nodes (16): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+8 more)

### Community 17 - "products.ts"
Cohesion: 0.18
Nodes (19): SearchPage(), SearchPageProps, TABLE_PRODUCT_IMAGES, asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage() (+11 more)

### Community 18 - "order-actions.ts"
Cohesion: 0.13
Nodes (21): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, CheckoutForm(), FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, initialState (+13 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.11
Nodes (31): applySettle(), asNumber(), handlePayHereNotify(), header(), loadOrderPaymentItems(), ok(), paymentAlreadyPaid(), planStockDecrements() (+23 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "hasAppwritePublicConfig"
Cohesion: 0.18
Nodes (21): hasAppwritePublicConfig(), listOwnOrders(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString(), asNumber(), asRating() (+13 more)

### Community 23 - "bank-slip-review.ts"
Cohesion: 0.09
Nodes (39): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+31 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "createAdminClient"
Cohesion: 0.05
Nodes (70): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, ADMIN_NAV, AdminLayout(), AdminReportsPage() (+62 more)

### Community 27 - "user-management.ts"
Cohesion: 0.14
Nodes (25): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, clsx, lucide-react, next, dependencies, appwrite, clsx, lucide-react (+11 more)

### Community 29 - "createPublicClient"
Cohesion: 0.17
Nodes (16): CategoryPage(), CategoryPageProps, Home(), HomeProps, ShopPage(), ShopPageProps, ProductCatalogFilters(), ProductList() (+8 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (57): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+49 more)

### Community 31 - "notification-bell.tsx"
Cohesion: 0.27
Nodes (10): formatRelative(), NotificationBell(), Popover(), PopoverContent(), PopoverHeader(), PopoverTitle(), PopoverTrigger(), getOwnNotificationFeed() (+2 more)

### Community 32 - "userHasLabel"
Cohesion: 0.27
Nodes (10): GET(), RouteParams, SELLER_NAV, SellerLayout(), BecomeSellerPage(), requireUser(), ROLE_LABELS, RoleLabel (+2 more)

### Community 33 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 34 - "orders.ts"
Cohesion: 0.18
Nodes (18): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+10 more)

### Community 35 - "button.tsx"
Cohesion: 0.18
Nodes (4): Button(), buttonVariants, ErrorFallback(), ErrorFallbackProps

### Community 36 - "seller-approvals.ts"
Cohesion: 0.12
Nodes (29): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+21 more)

### Community 37 - "cn"
Cohesion: 0.26
Nodes (9): PortalNavItem, PortalShellProps, SideNav(), Badge(), badgeVariants, Input(), PopoverDescription(), Separator() (+1 more)

### Community 38 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 39 - "wishlist.ts"
Cohesion: 0.22
Nodes (18): TABLE_WISHLIST_ITEMS, addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine(), WISHLIST_ERROR_CODES, WishlistActionState (+10 more)

### Community 40 - "admin-orders.ts"
Cohesion: 0.14
Nodes (29): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+21 more)

### Community 41 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 42 - "Trust rules (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (11): Data sources (read-only), Fraud / risk flags, Future: manual Verified override, List scan limits, `new_seller_high_first_order`, No persisted state, `open_unresolved_reports`, `rapid_cancellation_rate` (+3 more)

### Community 43 - "verify-admin-analytics.mjs"
Cohesion: 0.22
Nodes (8): emptySales, generateBucketKeys(), keys12, keys30, r12, r30, toDayBucket(), toMonthBucket()

### Community 45 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 46 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

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

### Community 51 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (this Function — Member 1 step 1.22)

### Community 52 - "getLoggedInUser"
Cohesion: 0.15
Nodes (23): LoginPage(), safeNextPath(), CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage() (+15 more)

### Community 54 - "product-reviews-placeholder.tsx"
Cohesion: 0.27
Nodes (6): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, createProductReview(), revalidateReviewPaths(), CreateProductReviewInput, Review

### Community 55 - "wishlist-list.tsx"
Cohesion: 0.31
Nodes (7): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, removeFromWishlist(), WishlistLine

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "products/[id]/page.tsx"
Cohesion: 0.22
Nodes (11): ProductPage(), ProductPageProps, WishlistPage(), WishlistToggleButton(), WishlistToggleButtonProps, getProduct(), listProductImages(), addToWishlist() (+3 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "shop-profile-form.tsx"
Cohesion: 0.17
Nodes (18): SellerShopPage(), initialState, SellerApplyForm(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts() (+10 more)

### Community 65 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "verify-seller-status-gate.ts"
Cohesion: 0.25
Nodes (4): SellerApplicationStatus(), SellerApplicationStatusProps, SellerProfile, ok

### Community 71 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 72 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

## Knowledge Gaps
- **431 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+426 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `reports.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `types/index.ts`, `listing-moderation.ts`, `services/index.ts`, `free-order.ts`, `dashboard/page.tsx`, `seller-application.ts`, `hasAppwritePublicConfig`, `bank-slip-review.ts`, `createAdminClient`, `user-management.ts`, `createPublicClient`, `userHasLabel`, `orders.ts`, `seller-approvals.ts`, `wishlist.ts`, `products/[id]/page.tsx`, `shop-profile-form.tsx`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `userHasLabel`, `reports.ts`, `platform-settings-admin.ts`, `categories.ts`, `seller-approvals.ts`, `listing-moderation.ts`, `admin-orders.ts`, `services/index.ts`, `admin-analytics.ts`, `free-order.ts`, `seller-application.ts`, `bank-slip-review.ts`, `user-management.ts`, `createPublicClient`, `trust-signals.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `store-navbar.tsx`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `types/index.ts`, `listing-moderation.ts`, `checkout-form.tsx`, `dashboard/page.tsx`, `products.ts`, `order-actions.ts`, `bank-slip-review.ts`, `createAdminClient`, `user-management.ts`, `createPublicClient`, `notification-bell.tsx`, `seller-approvals.ts`, `cn`, `admin-orders.ts`, `getLoggedInUser`, `product-reviews-placeholder.tsx`, `wishlist-list.tsx`, `products/[id]/page.tsx`, `shop-profile-form.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _431 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `reports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057297297297297295 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07619738751814223 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09568627450980392 - nodes in this community are weakly interconnected._