# Graph Report - knurdz-marketplace  (2026-08-15)

## Corpus Check
- 230 files · ~104,761 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1816 nodes · 5032 edges · 89 communities (77 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81e4a40a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- order-actions.ts
- auth.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- rules.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- seller-listings.ts
- free-order.ts
- compilerOptions
- admin/orders/page.tsx
- services/index.ts
- products.ts
- notify-logs.ts
- Work Distribution — Knurdz Marketplace
- verify-payhere-notify.ts
- components.json
- reviews.ts
- bank-slip-actions.ts
- devDependencies
- seed-demo.mjs
- report-triage.ts
- user-management.ts
- dependencies
- getLoggedInUser
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (18)
- createAdminClient
- error-fallback.tsx
- seller-approvals.ts
- button.tsx
- DATABASE_ID
- wishlist.ts
- orders.ts
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
- edit-listing-form.tsx
- admin-orders.ts
- config.ts
- wishlist-list.tsx
- Agent reference docs
- devDependencies
- platform-settings-manager.tsx
- package.json
- shadcn
- AGENTS.md
- shop-profile-form.tsx
- eslint.config.mjs
- roles.ts
- next.config.ts
- payhere-checkout-hash/package.json
- postcss.config.mjs
- payhere-notify/package.json
- admin-metrics.ts
- seller-approval-actions.tsx
- dashboard/page.tsx
- hasAppwritePublicConfig
- node-appwrite
- app/layout.tsx
- shadcn
- Sandbox demo (step 1.27)
- tw-animate-css
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- platform-settings.ts
- audit/page.tsx
- Hash Function
- Member 1 — Foundation (must-dos first)
- Member 4 — Admin, moderation, trust
- react
- clsx
- (store)/layout.tsx
- sellers.ts

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 109 edges
2. `createAdminClient()` - 94 edges
3. `createSessionClient()` - 83 edges
4. `hasAppwritePublicConfig()` - 77 edges
5. `Button()` - 51 edges
6. `userHasLabel()` - 40 edges
7. `assertRateLimit()` - 32 edges
8. `cn()` - 31 edges
9. `DATABASE_ID` - 30 edges
10. `getOwnOrder()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `requireLabel()`  [EXTRACTED]
  app/admin/layout.tsx → lib/appwrite/roles.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `CreateListingForm()` --indirect_call--> `createDraftListing()`  [INFERRED]
  components/seller/create-listing-form.tsx → lib/appwrite/seller-listing-actions.ts
- `SellerApplyForm()` --indirect_call--> `submitSellerApplication()`  [INFERRED]
  components/seller/seller-apply-form.tsx → lib/appwrite/seller-application-actions.ts
- `CheckoutForm()` --indirect_call--> `createOrder()`  [INFERRED]
  components/store/checkout-form.tsx → lib/services/order-actions.ts

## Import Cycles
- None detected.

## Communities (89 total, 12 thin omitted)

### Community 0 - "order-actions.ts"
Cohesion: 0.14
Nodes (20): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, initialState, OrderCancelForm() (+12 more)

### Community 1 - "auth.ts"
Cohesion: 0.08
Nodes (42): SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm(), initialState (+34 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.15
Nodes (20): AdminSettingsPage(), PlatformSettingsManager(), ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, assertAdminUser(), BOOLEAN_KEYS, isAllowlistedKey() (+12 more)

### Community 3 - "categories.ts"
Cohesion: 0.10
Nodes (43): AdminCategoriesPage(), NewListingPage(), CategoriesPage(), CategoriesManager(), CategoryRow(), CreateCategoryForm(), parentOptions(), useCategoryToast() (+35 more)

### Community 4 - "createSessionClient"
Cohesion: 0.11
Nodes (42): CartPage(), CheckoutPage(), AddToCartButton(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+34 more)

### Community 5 - "types/index.ts"
Cohesion: 0.13
Nodes (29): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, ProductImage (+21 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (35): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+27 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "rules.ts"
Cohesion: 0.12
Nodes (23): BadgeEligibilityResult, CANCELLATION_RATE_THRESHOLD, daysSince(), evaluateBadgeEligibility(), evaluateFraudFlags(), FRAUD_ROLLING_WINDOW_DAYS, HIGH_FIRST_ORDER_AMOUNT_LKR, isWithinRollingWindow() (+15 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "seller-listings.ts"
Cohesion: 0.06
Nodes (64): EditListingPage(), EditListingPageProps, formatPrice(), SellerListingsPage(), DeleteImageButton(), EditListingForm(), useActionToasts(), initial (+56 more)

### Community 13 - "free-order.ts"
Cohesion: 0.10
Nodes (29): adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder(), normalizeOrderId() (+21 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "admin/orders/page.tsx"
Cohesion: 0.15
Nodes (20): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+12 more)

### Community 16 - "services/index.ts"
Cohesion: 0.15
Nodes (22): existingApplicationMessage(), getOwnSellerProfile(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult (+14 more)

### Community 17 - "products.ts"
Cohesion: 0.14
Nodes (24): CategoryPage(), Home(), SearchPage(), ShopPage(), ShopPageProps, asBoolean(), asNullableString(), asNumber() (+16 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.10
Nodes (34): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, isNotifyLogIssue() (+26 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.08
Nodes (44): compactString(), NOTIFY_PAYLOAD_ALLOWLIST, notifyLogRowFromDecision(), notifyLogRowHasSecret(), sanitizeNotifyPayload(), applySettle(), asNumber(), handlePayHereNotify() (+36 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "reviews.ts"
Cohesion: 0.12
Nodes (25): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, listOwnOrders(), createProductReview(), revalidateReviewPaths(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode (+17 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.18
Nodes (18): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.16
Nodes (21): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+13 more)

### Community 26 - "report-triage.ts"
Cohesion: 0.07
Nodes (57): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+49 more)

### Community 27 - "user-management.ts"
Cohesion: 0.14
Nodes (25): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, dependencies, appwrite, class-variance-authority, lucide-react (+11 more)

### Community 29 - "getLoggedInUser"
Cohesion: 0.17
Nodes (21): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage() (+13 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.13
Nodes (33): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+25 more)

### Community 31 - "cn"
Cohesion: 0.12
Nodes (29): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, formatRelative(), NotificationBell(), ReportListingButton(), ReportListingButtonProps (+21 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.11
Nodes (26): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+18 more)

### Community 33 - "Tables (18)"
Cohesion: 0.11
Nodes (19): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+11 more)

### Community 34 - "createAdminClient"
Cohesion: 0.20
Nodes (21): GET(), RouteParams, createAdminClient(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists(), BankSlipReviewResult (+13 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.17
Nodes (16): AdminSellersPage(), formatAppliedAt(), AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), listPendingSellerApplications(), loadSellerProfileRow() (+8 more)

### Community 37 - "button.tsx"
Cohesion: 0.17
Nodes (15): CategoryPageProps, HomeProps, SearchPageProps, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, ProductCatalogFilters() (+7 more)

### Community 38 - "DATABASE_ID"
Cohesion: 0.17
Nodes (17): DATABASE_ID, TABLE_AUDIT_LOGS, requireLabel(), adminSdkAvailable(), asAuditLogEntry(), asNullableString(), buildListQueries(), clampLimit() (+9 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.16
Nodes (24): WishlistToggleButton(), WishlistToggleButtonProps, TABLE_WISHLIST_ITEMS, addToWishlist(), revalidateWishlistPaths(), toggleWishlistProduct(), addToOwnWishlist(), asNullableString() (+16 more)

### Community 40 - "orders.ts"
Cohesion: 0.12
Nodes (31): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+23 more)

### Community 41 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.15
Nodes (13): Checkout URLs, Consumer contract (step 1.28), Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox) (+5 more)

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

### Community 51 - "edit-listing-form.tsx"
Cohesion: 0.13
Nodes (16): CategoriesManagerProps, CategoryRowProps, initial, CreateListingForm(), CreateListingFormProps, initialState, EditListingFormProps, initial (+8 more)

### Community 52 - "admin-orders.ts"
Cohesion: 0.36
Nodes (10): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), ListAllOrdersResult (+2 more)

### Community 54 - "config.ts"
Cohesion: 0.05
Nodes (82): AccountPage(), WishlistPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps (+74 more)

### Community 55 - "wishlist-list.tsx"
Cohesion: 0.31
Nodes (7): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, removeFromWishlist(), WishlistLine

### Community 56 - "Agent reference docs"
Cohesion: 0.33
Nodes (6): Agent reference docs, By member, Non-negotiables, Payment setup status, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "platform-settings-manager.tsx"
Cohesion: 0.16
Nodes (16): BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManagerProps, SettingFieldForm(), useSettingToast(), assertAdmin() (+8 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "shop-profile-form.tsx"
Cohesion: 0.22
Nodes (13): SellerShopPage(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts(), readString(), revalidateShopPaths() (+5 more)

### Community 65 - "roles.ts"
Cohesion: 0.12
Nodes (23): ADMIN_NAV, AdminLayout(), LoginPage(), RegisterPage(), SELLER_NAV, SellerLayout(), BecomeSellerPage(), PortalShell() (+15 more)

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "admin-metrics.ts"
Cohesion: 0.23
Nodes (14): AdminPage(), formatCount(), formatRevenue(), AdminMetrics, asNullableString(), asNumber(), countTableRows(), countUsers() (+6 more)

### Community 71 - "seller-approval-actions.tsx"
Cohesion: 0.26
Nodes (12): approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm(), useApprovalToast(), approveSellerApplication() (+4 more)

### Community 72 - "dashboard/page.tsx"
Cohesion: 0.28
Nodes (8): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), Order

### Community 73 - "hasAppwritePublicConfig"
Cohesion: 0.47
Nodes (8): ProductPage(), ProductPageProps, hasAppwritePublicConfig(), createPublicClient(), getProduct(), listProductImages(), canReviewProduct(), listProductReviews()

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 77 - "Sandbox demo (step 1.27)"
Cohesion: 0.29
Nodes (7): Decline, cancel, idempotency, Free path (seeded), Happy path (PayHere), Local Next.js vs `notify_url`, Prerequisites, Sandbox demo (step 1.27), Test cards (sandbox only)

### Community 79 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 80 - "platform-settings.ts"
Cohesion: 0.44
Nodes (8): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables(), PlatformSetting

### Community 81 - "audit/page.tsx"
Cohesion: 0.48
Nodes (6): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, parseAuditLogFilter()

### Community 82 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (this Function — Member 1 step 1.22)

### Community 83 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 84 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 91 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 93 - "sellers.ts"
Cohesion: 0.21
Nodes (11): SellerInfoCard(), SellerInfoCardProps, asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId(), getSellerBankDetailsForCheckout(), isApprovedPublicSellerStatus(), PublicSellerInfo (+3 more)

## Knowledge Gaps
- **477 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+472 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `seller-listings.ts`, `free-order.ts`, `services/index.ts`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management.ts`, `types/payhere.ts`, `createAdminClient`, `button.tsx`, `wishlist.ts`, `orders.ts`, `config.ts`, `platform-settings-manager.tsx`, `roles.ts`, `seller-approval-actions.tsx`, `dashboard/page.tsx`, `hasAppwritePublicConfig`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `order-actions.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `seller-listings.ts`, `admin/orders/page.tsx`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management.ts`, `getLoggedInUser`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `wishlist.ts`, `edit-listing-form.tsx`, `config.ts`, `wishlist-list.tsx`, `platform-settings-manager.tsx`, `shop-profile-form.tsx`, `seller-approval-actions.tsx`, `dashboard/page.tsx`, `hasAppwritePublicConfig`, `audit/page.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `free-order.ts`, `services/index.ts`, `products.ts`, `notify-logs.ts`, `report-triage.ts`, `user-management.ts`, `trust-signals.ts`, `seller-approvals.ts`, `DATABASE_ID`, `admin-orders.ts`, `config.ts`, `platform-settings-manager.tsx`, `admin-metrics.ts`, `sellers.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _477 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order-actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07727272727272727 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09898242368177614 - nodes in this community are weakly interconnected._