# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 220 files · ~95,868 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1696 nodes · 4609 edges · 88 communities (76 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44f5699b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- portal-shell.tsx
- recovery.ts
- platform-settings-admin.ts
- categories.ts
- cart.ts
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- config.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- button.tsx
- free-order-rules.ts
- compilerOptions
- dashboard/page.tsx
- seller-application.ts
- products.ts
- notify-logs.ts
- Work Distribution — Knurdz Marketplace
- verify-payhere-notify.ts
- components.json
- hasAppwritePublicConfig
- bank-slip-actions.ts
- devDependencies
- seed-demo.mjs
- report-triage-actions.tsx
- user-management.ts
- dependencies
- getLoggedInUser
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (17)
- bank-slip-review.ts
- error-fallback.tsx
- seller-approvals.ts
- services/index.ts
- auth.ts
- wishlist.ts
- admin/orders/page.tsx
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
- orders.ts
- createAdminClient
- wishlist-list.tsx
- Agent reference docs
- devDependencies
- createSessionClient
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
- admin-metrics.ts
- reports.ts
- free-order.ts
- sellers.ts
- node-appwrite
- app/layout.tsx
- shadcn
- react
- tw-animate-css
- forgot-password-form.tsx
- admin-orders.ts
- 5. Member 1 — Core infrastructure (critical path)
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- 3. Shared contracts (do not fork)
- 7. Member 3 — Seller portal
- clsx

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 103 edges
2. `createAdminClient()` - 93 edges
3. `hasAppwritePublicConfig()` - 72 edges
4. `createSessionClient()` - 70 edges
5. `Button()` - 45 edges
6. `userHasLabel()` - 32 edges
7. `cn()` - 31 edges
8. `DATABASE_ID` - 28 edges
9. `getOwnOrder()` - 26 edges
10. `requireLabel()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `ForgotPasswordForm()` --indirect_call--> `requestPasswordRecovery()`  [INFERRED]
  components/auth/forgot-password-form.tsx → lib/appwrite/recovery.ts
- `ResetPasswordForm()` --indirect_call--> `completePasswordRecovery()`  [INFERRED]
  components/auth/reset-password-form.tsx → lib/appwrite/recovery.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (88 total, 12 thin omitted)

### Community 0 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 1 - "recovery.ts"
Cohesion: 0.14
Nodes (25): SearchParams, VerifyEmailPage(), initialState, ResendVerificationForm(), getAppUrl(), completeEmailVerification(), completePasswordRecovery(), mapRecoveryError() (+17 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (45): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+37 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (47): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+39 more)

### Community 4 - "cart.ts"
Cohesion: 0.08
Nodes (45): CartPage(), CheckoutPage(), StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar(), AddToCartButton() (+37 more)

### Community 5 - "types/index.ts"
Cohesion: 0.11
Nodes (38): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, Report, WishlistItem (+30 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.10
Nodes (37): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+29 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.06
Nodes (57): AdminAnalyticsPage(), PageProps, rangeHref(), AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps (+49 more)

### Community 9 - "config.ts"
Cohesion: 0.13
Nodes (27): WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, BANK_SLIP_EXTENSIONS (+19 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.14
Nodes (14): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 4. How agents should work (all members), 9. Integration map (who waits on whom), Approved MCPs (agents) (+6 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.10
Nodes (35): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper(), objectHasSecretKey() (+27 more)

### Community 12 - "button.tsx"
Cohesion: 0.11
Nodes (22): AddToCartButtonProps, BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, initialState (+14 more)

### Community 13 - "free-order-rules.ts"
Cohesion: 0.14
Nodes (17): evaluateFreeConfirm(), FREE_CONFIRM_CLOSED, FREE_CONFIRM_NO_ITEMS, FREE_CONFIRM_NOT_FOUND, FREE_CONFIRM_NOT_FREE, FREE_CONFIRM_STOCK, FREE_CONFIRM_WRONG_STATE, FreeConfirmDecision (+9 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (18): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrdersPage() (+10 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.09
Nodes (30): GET(), RouteParams, SELLER_NAV, SellerLayout(), BecomeSellerPage(), NavLinks(), BUCKET_BANK_SLIPS, requireUser() (+22 more)

### Community 17 - "products.ts"
Cohesion: 0.10
Nodes (31): SellerShopPage(), CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ShopPage() (+23 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.10
Nodes (30): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, isNotifyLogIssue() (+22 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.10
Nodes (20): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Member 4 — Admin, moderation, trust, Member 4 — verification extras (+12 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.11
Nodes (31): applySettle(), asNumber(), handlePayHereNotify(), header(), loadOrderPaymentItems(), ok(), paymentAlreadyPaid(), planStockDecrements() (+23 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "hasAppwritePublicConfig"
Cohesion: 0.11
Nodes (32): ProductPage(), ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, hasAppwritePublicConfig(), listOwnOrders(), getProduct(), listProductImages() (+24 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.18
Nodes (18): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "report-triage-actions.tsx"
Cohesion: 0.14
Nodes (23): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+15 more)

### Community 27 - "user-management.ts"
Cohesion: 0.14
Nodes (25): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, dependencies, appwrite, class-variance-authority, lucide-react (+11 more)

### Community 29 - "getLoggedInUser"
Cohesion: 0.20
Nodes (17): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), TABLE_PROFILES, asProfile(), createProfileForUser() (+9 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (58): AdminTrustPage(), RULE_LABELS, ruleLabel(), TABLE_BANK_SLIPS, adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk() (+50 more)

### Community 31 - "cn"
Cohesion: 0.17
Nodes (18): formatRelative(), NotificationBell(), SellerApplicationStatus(), SellerApplicationStatusProps, Badge(), badgeVariants, Popover(), PopoverContent() (+10 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.11
Nodes (24): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+16 more)

### Community 33 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 34 - "bank-slip-review.ts"
Cohesion: 0.16
Nodes (25): TABLE_ORDER_ITEMS, fetchPaymentsByOrderIds(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists(), BankSlipReviewResult, clampLimit() (+17 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.12
Nodes (29): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+21 more)

### Community 37 - "services/index.ts"
Cohesion: 0.21
Nodes (19): AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, IMAGE_EXTENSIONS, PRODUCT_IMAGE_MAX_BYTES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+11 more)

### Community 38 - "auth.ts"
Cohesion: 0.18
Nodes (16): LoginPage(), safeNextPath(), RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState (+8 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.17
Nodes (22): WishlistToggleButton(), WishlistToggleButtonProps, TABLE_WISHLIST_ITEMS, addToWishlist(), revalidateWishlistPaths(), toggleWishlistProduct(), addToOwnWishlist(), asNullableString() (+14 more)

### Community 40 - "admin/orders/page.tsx"
Cohesion: 0.27
Nodes (12): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+4 more)

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

### Community 52 - "orders.ts"
Cohesion: 0.07
Nodes (55): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage() (+47 more)

### Community 54 - "createAdminClient"
Cohesion: 0.20
Nodes (20): TABLE_PRODUCTS, createAdminClient(), AdminReportView, adminSdkAvailable(), asCreatedAt(), auditMeta(), DISMISSED_STATUS, dismissReportCore() (+12 more)

### Community 55 - "wishlist-list.tsx"
Cohesion: 0.67
Nodes (3): issueLabel(), WishlistList(), WishlistListProps

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "createSessionClient"
Cohesion: 0.31
Nodes (13): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+5 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "shop-profile-form.tsx"
Cohesion: 0.20
Nodes (15): initialState, SellerApplyForm(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts(), readString() (+7 more)

### Community 65 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "admin-metrics.ts"
Cohesion: 0.23
Nodes (14): AdminPage(), formatCount(), formatRevenue(), TABLE_ORDERS, TABLE_PAYMENTS, AdminMetrics, asNullableString(), asNumber() (+6 more)

### Community 71 - "reports.ts"
Cohesion: 0.24
Nodes (13): TABLE_REPORTS, REPORT_ERROR_CODES, ReportActionState, ReportErrorCode, asNullableString(), asReport(), assertReportMutationRateLimit(), createProductReport() (+5 more)

### Community 72 - "free-order.ts"
Cohesion: 0.24
Nodes (14): adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder(), normalizeOrderId() (+6 more)

### Community 73 - "sellers.ts"
Cohesion: 0.21
Nodes (9): SellerInfoCard(), SellerInfoCardProps, TABLE_SELLER_PROFILES, asNullableString(), CheckoutSellerBankDetails, isApprovedPublicSellerStatus(), PublicSellerInfo, toPublicSellerInfo() (+1 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 80 - "forgot-password-form.tsx"
Cohesion: 0.20
Nodes (6): SearchParams, ForgotPasswordForm(), initialState, initialState, ResetPasswordForm(), RecoveryActionState

### Community 81 - "admin-orders.ts"
Cohesion: 0.40
Nodes (9): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), listAllOrders(), ListAllOrdersResult, listOrdersDirect() (+1 more)

### Community 82 - "5. Member 1 — Core infrastructure (critical path)"
Cohesion: 0.33
Nodes (6): 5. Member 1 — Core infrastructure (critical path), Blocker rule, Dependencies, Member 1 — Definition of done, Step-by-step plan (small slices), You are building

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

## Knowledge Gaps
- **441 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+436 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `recovery.ts`, `platform-settings-admin.ts`, `categories.ts`, `cart.ts`, `listing-moderation.ts`, `config.ts`, `dashboard/page.tsx`, `seller-application.ts`, `hasAppwritePublicConfig`, `bank-slip-actions.ts`, `report-triage-actions.tsx`, `user-management.ts`, `types/payhere.ts`, `seller-approvals.ts`, `services/index.ts`, `auth.ts`, `wishlist.ts`, `orders.ts`, `createSessionClient`, `reports.ts`, `free-order.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `config.ts`, `seller-application.ts`, `products.ts`, `notify-logs.ts`, `user-management.ts`, `getLoggedInUser`, `trust-signals.ts`, `bank-slip-review.ts`, `seller-approvals.ts`, `services/index.ts`, `auth.ts`, `orders.ts`, `createSessionClient`, `admin-metrics.ts`, `free-order.ts`, `sellers.ts`, `admin-orders.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `portal-shell.tsx`, `platform-settings-admin.ts`, `categories.ts`, `cart.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `config.ts`, `dashboard/page.tsx`, `products.ts`, `hasAppwritePublicConfig`, `bank-slip-actions.ts`, `report-triage-actions.tsx`, `user-management.ts`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `seller-approvals.ts`, `wishlist.ts`, `admin/orders/page.tsx`, `orders.ts`, `shop-profile-form.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _441 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `recovery.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07767722473604827 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09143686502177069 - nodes in this community are weakly interconnected._