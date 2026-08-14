# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 221 files · ~98,448 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1730 nodes · 4690 edges · 93 communities (81 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b531606c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- portal-shell.tsx
- auth.ts
- platform-settings-admin.ts
- categories.ts
- cart.ts
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- createAdminClient
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- search/page.tsx
- free-order-rules.ts
- compilerOptions
- orders/[id]/page.tsx
- seller-application.ts
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
- profiles.ts
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (18)
- bank-slip-review.ts
- error-fallback.tsx
- seller-approvals.ts
- storage.ts
- reports.ts
- hasAppwritePublicConfig
- getLoggedInUser
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
- button.tsx
- admin/orders/page.tsx
- config.ts
- wishlist/page.tsx
- Agent reference docs
- devDependencies
- createSessionClient
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
- audit-logs.ts
- dashboard/page.tsx
- services/index.ts
- node-appwrite
- app/layout.tsx
- shadcn
- Sandbox demo (step 1.27)
- tw-animate-css
- 5. Member 1 — Core infrastructure (critical path)
- admin-orders.ts
- Hash Function
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- 3. Shared contracts (do not fork)
- 7. Member 3 — Seller portal
- class-variance-authority
- clsx
- seller-approval-actions.tsx
- (store)/layout.tsx
- products/[id]/page.tsx
- DATABASE_ID

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 103 edges
2. `createAdminClient()` - 94 edges
3. `hasAppwritePublicConfig()` - 72 edges
4. `createSessionClient()` - 70 edges
5. `Button()` - 45 edges
6. `userHasLabel()` - 32 edges
7. `cn()` - 31 edges
8. `DATABASE_ID` - 29 edges
9. `getOwnOrder()` - 26 edges
10. `requireLabel()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `AdminLayout()` --calls--> `requireLabel()`  [EXTRACTED]
  app/admin/layout.tsx → lib/appwrite/roles.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SettingFieldForm()` --indirect_call--> `updatePlatformSettingFormAction()`  [INFERRED]
  components/admin/platform-settings-manager.tsx → lib/appwrite/platform-settings-actions.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (93 total, 12 thin omitted)

### Community 0 - "portal-shell.tsx"
Cohesion: 0.19
Nodes (13): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButtonProps, Sheet(), SheetContent(), SheetDescription() (+5 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (47): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+39 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.12
Nodes (30): AdminSettingsPage(), PlatformSettingsManager(), ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, assertAdminUser(), BOOLEAN_KEYS, findSettingByKey() (+22 more)

### Community 3 - "categories.ts"
Cohesion: 0.10
Nodes (45): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+37 more)

### Community 4 - "cart.ts"
Cohesion: 0.11
Nodes (41): CartPage(), CheckoutPage(), AddToCartButton(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+33 more)

### Community 5 - "types/index.ts"
Cohesion: 0.09
Nodes (45): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, CartView, Category (+37 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (35): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+27 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "createAdminClient"
Cohesion: 0.28
Nodes (14): createAdminClient(), adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder() (+6 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.14
Nodes (14): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 4. How agents should work (all members), 9. Integration map (who waits on whom), Approved MCPs (agents) (+6 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "search/page.tsx"
Cohesion: 0.26
Nodes (8): CategoryPageProps, HomeProps, SearchPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS, ProductList(), ProductListProps

### Community 13 - "free-order-rules.ts"
Cohesion: 0.15
Nodes (16): evaluateFreeConfirm(), FREE_CONFIRM_CLOSED, FREE_CONFIRM_NO_ITEMS, FREE_CONFIRM_NOT_FOUND, FREE_CONFIRM_NOT_FREE, FREE_CONFIRM_STOCK, FREE_CONFIRM_WRONG_STATE, FreeConfirmDecision (+8 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "orders/[id]/page.tsx"
Cohesion: 0.19
Nodes (15): OrderDetailPage(), OrderDetailPageProps, OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod() (+7 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.11
Nodes (17): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+9 more)

### Community 17 - "products.ts"
Cohesion: 0.13
Nodes (26): CategoryPage(), Home(), SearchPage(), ShopPage(), ShopPageProps, createPublicClient(), getCategoryBySlug(), asBoolean() (+18 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.09
Nodes (35): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, TABLE_PAYHERE_NOTIFY_LOGS (+27 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.08
Nodes (26): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras (+18 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.08
Nodes (44): compactString(), NOTIFY_PAYLOAD_ALLOWLIST, notifyLogRowFromDecision(), notifyLogRowHasSecret(), sanitizeNotifyPayload(), applySettle(), asNumber(), handlePayHereNotify() (+36 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "reviews.ts"
Cohesion: 0.18
Nodes (20): ProductPage(), TABLE_REVIEWS, getOwnOrderItems(), asNullableString(), asNumber(), asRating(), asReview(), assertReviewMutationRateLimit() (+12 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.18
Nodes (18): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "report-triage.ts"
Cohesion: 0.09
Nodes (42): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+34 more)

### Community 27 - "user-management.ts"
Cohesion: 0.14
Nodes (25): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, lucide-react, next, dependencies, appwrite, lucide-react, next, radix-ui (+11 more)

### Community 29 - "profiles.ts"
Cohesion: 0.24
Nodes (14): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), getOwnProfile(), Profile (+6 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (57): AdminTrustPage(), RULE_LABELS, ruleLabel(), requireLabel(), asBankSlip(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle() (+49 more)

### Community 31 - "cn"
Cohesion: 0.20
Nodes (16): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+8 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.11
Nodes (27): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), RATE_LIMIT_MESSAGE, mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest (+19 more)

### Community 33 - "Tables (18)"
Cohesion: 0.07
Nodes (27): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+19 more)

### Community 34 - "bank-slip-review.ts"
Cohesion: 0.15
Nodes (21): GET(), RouteParams, TABLE_BANK_SLIPS, TABLE_ORDER_ITEMS, adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists() (+13 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.18
Nodes (17): AdminSellersPage(), formatAppliedAt(), AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), asSellerProfile(), listPendingSellerApplications() (+9 more)

### Community 37 - "storage.ts"
Cohesion: 0.19
Nodes (17): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+9 more)

### Community 38 - "reports.ts"
Cohesion: 0.27
Nodes (12): getProduct(), REPORT_ERROR_CODES, ReportActionState, ReportErrorCode, asNullableString(), asReport(), createProductReport(), CreateProductReportInput (+4 more)

### Community 39 - "hasAppwritePublicConfig"
Cohesion: 0.20
Nodes (21): hasAppwritePublicConfig(), TABLE_WISHLIST_ITEMS, addToWishlist(), revalidateWishlistPaths(), addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem() (+13 more)

### Community 40 - "getLoggedInUser"
Cohesion: 0.07
Nodes (56): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps (+48 more)

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

### Community 51 - "button.tsx"
Cohesion: 0.11
Nodes (23): BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManagerProps, SettingFieldForm(), useSettingToast(), initialState (+15 more)

### Community 52 - "admin/orders/page.tsx"
Cohesion: 0.23
Nodes (13): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+5 more)

### Community 54 - "config.ts"
Cohesion: 0.15
Nodes (25): ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES (+17 more)

### Community 55 - "wishlist/page.tsx"
Cohesion: 0.26
Nodes (9): WishlistPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, listProductImages(), removeFromWishlist() (+1 more)

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "createSessionClient"
Cohesion: 0.33
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "shop-profile-form.tsx"
Cohesion: 0.19
Nodes (16): SellerShopPage(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts(), readString(), revalidateShopPaths() (+8 more)

### Community 65 - "roles.ts"
Cohesion: 0.13
Nodes (20): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), BecomeSellerPage(), PortalShell(), NavLinks(), SellerApplicationStatus() (+12 more)

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "admin-metrics.ts"
Cohesion: 0.25
Nodes (13): AdminPage(), formatCount(), formatRevenue(), TABLE_ORDERS, AdminMetrics, asNullableString(), asNumber(), countTableRows() (+5 more)

### Community 71 - "audit-logs.ts"
Cohesion: 0.23
Nodes (14): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, adminSdkAvailable(), asAuditLogEntry(), asNullableString() (+6 more)

### Community 72 - "dashboard/page.tsx"
Cohesion: 0.32
Nodes (7): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel()

### Community 73 - "services/index.ts"
Cohesion: 0.24
Nodes (13): TABLE_SELLER_PROFILES, REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, updateOwnShopBannerCore(), asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId() (+5 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 77 - "Sandbox demo (step 1.27)"
Cohesion: 0.29
Nodes (7): Decline, cancel, idempotency, Free path (not seeded), Happy path (PayHere), Local Next.js vs `notify_url`, Prerequisites, Sandbox demo (step 1.27), Test cards (sandbox only)

### Community 80 - "5. Member 1 — Core infrastructure (critical path)"
Cohesion: 0.33
Nodes (6): 5. Member 1 — Core infrastructure (critical path), Blocker rule, Dependencies, Member 1 — Definition of done, Step-by-step plan (small slices), You are building

### Community 81 - "admin-orders.ts"
Cohesion: 0.23
Nodes (17): TABLE_PAYMENTS, AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders() (+9 more)

### Community 82 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (this Function — Member 1 step 1.22)

### Community 83 - "6. Member 2 — Buyer / storefront"
Cohesion: 0.33
Nodes (6): 6. Member 2 — Buyer / storefront, Dependencies, Member 2 — Agent sub-prompt example, Member 2 — Definition of done, Step-by-step plan, You are building

### Community 84 - "8. Member 4 — Admin, moderation, trust"
Cohesion: 0.33
Nodes (6): 8. Member 4 — Admin, moderation, trust, Dependencies, Member 4 — Critical security steps (never skip), Member 4 — Definition of done, Step-by-step plan, You are building

### Community 85 - "3. Shared contracts (do not fork)"
Cohesion: 0.40
Nodes (5): 3. Shared contracts (do not fork), Agent rules every step, Minimum collections (Member 1 creates), Ownership of payments, Status enums

### Community 86 - "7. Member 3 — Seller portal"
Cohesion: 0.40
Nodes (5): 7. Member 3 — Seller portal, Dependencies, Member 3 — Definition of done, Step-by-step plan, You are building

### Community 89 - "seller-approval-actions.tsx"
Cohesion: 0.26
Nodes (12): approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm(), useApprovalToast(), approveSellerApplication() (+4 more)

### Community 91 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 93 - "products/[id]/page.tsx"
Cohesion: 0.14
Nodes (13): ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, ReportListingButton(), SellerInfoCard(), SellerInfoCardProps, WishlistToggleButton(), WishlistToggleButtonProps (+5 more)

### Community 94 - "DATABASE_ID"
Cohesion: 0.25
Nodes (7): DATABASE_ID, assert(), mapped, systemMapped, systemRow, validRow, verifyAppwriteLockdown()

## Knowledge Gaps
- **455 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+450 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `cart.ts`, `listing-moderation.ts`, `createAdminClient`, `orders/[id]/page.tsx`, `seller-application.ts`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management.ts`, `profiles.ts`, `types/payhere.ts`, `bank-slip-review.ts`, `storage.ts`, `reports.ts`, `hasAppwritePublicConfig`, `button.tsx`, `config.ts`, `wishlist/page.tsx`, `createSessionClient`, `shop-profile-form.tsx`, `roles.ts`, `dashboard/page.tsx`, `services/index.ts`, `seller-approval-actions.tsx`, `(store)/layout.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `seller-application.ts`, `products.ts`, `notify-logs.ts`, `report-triage.ts`, `user-management.ts`, `profiles.ts`, `trust-signals.ts`, `bank-slip-review.ts`, `seller-approvals.ts`, `storage.ts`, `config.ts`, `createSessionClient`, `admin-metrics.ts`, `audit-logs.ts`, `services/index.ts`, `admin-orders.ts`, `DATABASE_ID`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `portal-shell.tsx`, `categories.ts`, `cart.ts`, `listing-moderation.ts`, `search/page.tsx`, `orders/[id]/page.tsx`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management.ts`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `getLoggedInUser`, `admin/orders/page.tsx`, `wishlist/page.tsx`, `shop-profile-form.tsx`, `audit-logs.ts`, `dashboard/page.tsx`, `seller-approval-actions.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _455 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0671602326811211 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11596638655462185 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09568627450980392 - nodes in this community are weakly interconnected._