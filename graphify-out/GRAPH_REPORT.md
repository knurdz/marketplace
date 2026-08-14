# Graph Report - knurdz-marketplace  (2026-08-15)

## Corpus Check
- 230 files · ~104,814 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1816 nodes · 5032 edges · 96 communities (84 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81e4a40a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- portal-shell.tsx
- assertRateLimit
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- status.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- config.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- seller-listings.ts
- free-order-rules.ts
- compilerOptions
- dashboard/page.tsx
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
- roles.ts
- dependencies
- getLoggedInUser
- rules.ts
- cn
- types/index.ts
- Tables (18)
- createAdminClient
- error-fallback.tsx
- seller-approvals.ts
- cart-contents.tsx
- edit-listing-form.tsx
- wishlist.ts
- order-actions.ts
- PayHere contract (Knurdz Marketplace)
- Trust rules (Knurdz Marketplace)
- verify-admin-analytics.mjs
- page-loader.tsx
- legal-page.tsx
- profiles.ts
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- button.tsx
- admin-orders.ts
- server.ts
- toast.ts
- Agent reference docs
- devDependencies
- trust-signals.ts
- package.json
- shadcn
- AGENTS.md
- storage.ts
- eslint.config.mjs
- ROLE_LABELS
- next.config.ts
- payhere-checkout-hash/package.json
- postcss.config.mjs
- payhere-notify/package.json
- appwrite/notifications.ts
- requireLabel
- admin-metrics.ts
- free-order.ts
- node-appwrite
- app/layout.tsx
- shadcn
- listSellersWithFlags
- tw-animate-css
- notify-logs/page.tsx
- services/payhere.ts
- services/index.ts
- bank-slips/page.tsx
- Member 1 — Foundation (must-dos first)
- audit/page.tsx
- 5. Member 1 — Core infrastructure (critical path)
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- clsx
- payhere-payment-status.tsx
- wishlist-list.tsx
- 3. Shared contracts (do not fork)
- 2. Technical stack (detail)
- sellers.ts
- Member 3 — Seller portal
- class-variance-authority

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
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `ResendVerificationForm()` --indirect_call--> `requestEmailVerification()`  [INFERRED]
  components/auth/resend-verification-form.tsx → lib/appwrite/recovery.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `CreateListingForm()` --indirect_call--> `createDraftListing()`  [INFERRED]
  components/seller/create-listing-form.tsx → lib/appwrite/seller-listing-actions.ts
- `SellerApplyForm()` --indirect_call--> `submitSellerApplication()`  [INFERRED]
  components/seller/seller-apply-form.tsx → lib/appwrite/seller-application-actions.ts

## Import Cycles
- None detected.

## Communities (96 total, 12 thin omitted)

### Community 0 - "portal-shell.tsx"
Cohesion: 0.13
Nodes (18): PortalNavItem, PortalShellProps, SideNav(), SkipToContent(), StoreNavbar(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps (+10 more)

### Community 1 - "assertRateLimit"
Cohesion: 0.10
Nodes (28): SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, ResetPasswordForm(), getAppUrl() (+20 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (46): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+38 more)

### Community 3 - "categories.ts"
Cohesion: 0.10
Nodes (43): AdminCategoriesPage(), NewListingPage(), CategoriesPage(), CategoriesManager(), CategoryRow(), CreateCategoryForm(), parentOptions(), useCategoryToast() (+35 more)

### Community 4 - "createSessionClient"
Cohesion: 0.25
Nodes (24): createSessionClient(), addToCart(), asCart(), asCartItem(), asNullableString(), asNumber(), assertCartMutationRateLimit(), buildCartLine() (+16 more)

### Community 5 - "status.ts"
Cohesion: 0.14
Nodes (17): BANK_SLIP_STATUSES, HAPPY_PATH, isBankSlipStatus(), isOneOf(), isOrderStatus(), isPaymentStatus(), isProductStatus(), ORDER_CANCELABLE_STATUSES (+9 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (34): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+26 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "config.ts"
Cohesion: 0.13
Nodes (25): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_BANK_SLIPS, PRODUCT_IMAGE_MAX_BYTES, SESSION_COOKIE, TABLE_AUDIT_LOGS (+17 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.13
Nodes (15): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 4. How agents should work (all members), 7. Member 3 — Seller portal, 9. Integration map (who waits on whom), Dependencies (+7 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "seller-listings.ts"
Cohesion: 0.08
Nodes (42): EditListingPage(), EditListingPageProps, formatPrice(), SellerListingsPage(), WishlistPage(), listProductImages(), ARCHIVED_STATUS, archivedMutationError() (+34 more)

### Community 13 - "free-order-rules.ts"
Cohesion: 0.14
Nodes (17): evaluateFreeConfirm(), FREE_CONFIRM_CLOSED, FREE_CONFIRM_NO_ITEMS, FREE_CONFIRM_NOT_FOUND, FREE_CONFIRM_NOT_FREE, FREE_CONFIRM_STOCK, FREE_CONFIRM_WRONG_STATE, FreeConfirmDecision (+9 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.14
Nodes (19): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrderListRow() (+11 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.11
Nodes (27): ShopProfileForm(), useActionToasts(), readString(), revalidateShopPaths(), SellerApplicationActionState, ShopProfileActionState, submitSellerApplication(), updateOwnShopBanner() (+19 more)

### Community 17 - "products.ts"
Cohesion: 0.19
Nodes (20): CategoryPage(), Home(), SearchPage(), asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage() (+12 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.15
Nodes (22): isNotifyLogIssue(), ISSUE_OUTCOMES, NOTIFY_LOG_OUTCOMES, NotifyLogOutcome, ParsedNotifyLog, parseNotifyLogText(), redactNotifyLogText(), adminSdkAvailable() (+14 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 4 — Admin, moderation, trust, Member 4 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.08
Nodes (44): compactString(), NOTIFY_PAYLOAD_ALLOWLIST, notifyLogRowFromDecision(), notifyLogRowHasSecret(), sanitizeNotifyPayload(), applySettle(), asNumber(), handlePayHereNotify() (+36 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "reviews.ts"
Cohesion: 0.17
Nodes (21): ProductPage(), ProductPageProps, getProduct(), isActiveProduct(), asNullableString(), asNumber(), asRating(), asReview() (+13 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.32
Nodes (11): BankSlipApproveButton(), BankSlipRejectForm(), initial, useBankSlipToast(), approveBankSlip(), approveBankSlipFormAction(), assertAdmin(), BankSlipActionState (+3 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.16
Nodes (21): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+13 more)

### Community 26 - "report-triage.ts"
Cohesion: 0.06
Nodes (58): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+50 more)

### Community 27 - "roles.ts"
Cohesion: 0.07
Nodes (49): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, LoginPage(), RegisterPage(), suspendInitial, unsuspendInitial (+41 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, lucide-react, next, dependencies, appwrite, lucide-react, next, radix-ui (+11 more)

### Community 29 - "getLoggedInUser"
Cohesion: 0.10
Nodes (42): CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage(), PayHereCancelPage(), PayHereCancelPageProps (+34 more)

### Community 30 - "rules.ts"
Cohesion: 0.11
Nodes (24): BadgeEligibilityResult, CANCELLATION_RATE_THRESHOLD, daysSince(), evaluateBadgeEligibility(), evaluateFraudFlags(), FRAUD_ROLLING_WINDOW_DAYS, HIGH_FIRST_ORDER_AMOUNT_LKR, isWithinRollingWindow() (+16 more)

### Community 31 - "cn"
Cohesion: 0.20
Nodes (16): formatRelative(), NotificationBell(), Badge(), badgeVariants, Label(), Popover(), PopoverContent(), PopoverDescription() (+8 more)

### Community 32 - "types/index.ts"
Cohesion: 0.10
Nodes (29): ProductReviewsPlaceholderProps, BankSlip, Cart, CartItem, CartLine, CartLineIssue, ProductImage, Review (+21 more)

### Community 33 - "Tables (18)"
Cohesion: 0.07
Nodes (27): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+19 more)

### Community 34 - "createAdminClient"
Cohesion: 0.19
Nodes (23): GET(), RouteParams, createAdminClient(), fetchPaymentsByOrderIds(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists() (+15 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.12
Nodes (29): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+21 more)

### Community 37 - "cart-contents.tsx"
Cohesion: 0.26
Nodes (13): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), addToCart() (+5 more)

### Community 38 - "edit-listing-form.tsx"
Cohesion: 0.16
Nodes (25): DeleteImageButton(), EditListingForm(), EditListingFormProps, initial, useActionToasts(), initial, SubmitListingButton(), SubmitListingButtonProps (+17 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.23
Nodes (18): addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine(), WISHLIST_ERROR_CODES, WishlistActionState, WishlistErrorCode (+10 more)

### Community 40 - "order-actions.ts"
Cohesion: 0.08
Nodes (36): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmForm() (+28 more)

### Community 41 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.06
Nodes (32): Checkout URLs, Consumer contract (step 1.28), Decline, cancel, idempotency, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Free path (seeded) (+24 more)

### Community 42 - "Trust rules (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (11): Data sources (read-only), Fraud / risk flags, Future: manual Verified override, List scan limits, `new_seller_high_first_order`, No persisted state, `open_unresolved_reports`, `rapid_cancellation_rate` (+3 more)

### Community 43 - "verify-admin-analytics.mjs"
Cohesion: 0.22
Nodes (8): emptySales, generateBucketKeys(), keys12, keys30, r12, r30, toDayBucket(), toMonthBucket()

### Community 45 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 46 - "profiles.ts"
Cohesion: 0.18
Nodes (18): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), initialState, ResendVerificationForm(), asProfile() (+10 more)

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
Nodes (23): CategoryPageProps, HomeProps, SearchPageProps, CategoriesManagerProps, CategoryRowProps, initial, CreateListingForm(), CreateListingFormProps (+15 more)

### Community 52 - "admin-orders.ts"
Cohesion: 0.18
Nodes (20): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+12 more)

### Community 54 - "server.ts"
Cohesion: 0.14
Nodes (18): ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), BUCKET_AVATARS, BUCKET_PRODUCT_IMAGES, getAppwriteEndpoint(), getAppwriteProjectId() (+10 more)

### Community 55 - "toast.ts"
Cohesion: 0.24
Nodes (8): WishlistRemoveButton(), WishlistRemoveButtonProps, WishlistToggleButton(), WishlistToggleButtonProps, addToWishlist(), removeFromWishlist(), revalidateWishlistPaths(), toggleWishlistProduct()

### Community 56 - "Agent reference docs"
Cohesion: 0.33
Nodes (6): Agent reference docs, By member, Non-negotiables, Payment setup status, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "trust-signals.ts"
Cohesion: 0.19
Nodes (21): asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller(), fetchOpenReportsForProductIds(), fetchOrdersForSellerIds(), fetchProductIdsForSellers(), fetchRejectedSlipsInWindow() (+13 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "storage.ts"
Cohesion: 0.19
Nodes (17): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+9 more)

### Community 65 - "ROLE_LABELS"
Cohesion: 0.15
Nodes (13): SELLER_NAV, SellerLayout(), SellerShopPage(), BecomeSellerPage(), SellerApplicationStatus(), SellerApplicationStatusProps, SellerApplyForm(), requireUser() (+5 more)

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 71 - "requireLabel"
Cohesion: 0.23
Nodes (13): ADMIN_NAV, AdminLayout(), PortalShell(), requireLabel(), adminSdkAvailable(), asAuditLogEntry(), asNullableString(), buildListQueries() (+5 more)

### Community 72 - "admin-metrics.ts"
Cohesion: 0.27
Nodes (12): AdminPage(), formatCount(), formatRevenue(), AdminMetrics, asNullableString(), asNumber(), countTableRows(), countUsers() (+4 more)

### Community 73 - "free-order.ts"
Cohesion: 0.25
Nodes (13): adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder(), normalizeOrderId() (+5 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 77 - "listSellersWithFlags"
Cohesion: 0.27
Nodes (12): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), evaluateSellerFromBundle(), fetchApprovedSellerProfiles(), fetchSellerProfileByUserId(), getSellerTrustSignals() (+4 more)

### Community 79 - "notify-logs/page.tsx"
Cohesion: 0.23
Nodes (11): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, NotifyLogSource (+3 more)

### Community 80 - "services/payhere.ts"
Cohesion: 0.36
Nodes (9): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), isNonEmptyString(), isPayHereSandboxActionUrl() (+1 more)

### Community 81 - "services/index.ts"
Cohesion: 0.19
Nodes (13): ProductReviewsPlaceholder(), CART_ERROR_CODES, CartActionState, CartErrorCode, ListNotifyLogsResult, ProductCatalogParams, ProductCatalogSort, createProductReview() (+5 more)

### Community 82 - "bank-slips/page.tsx"
Cohesion: 0.36
Nodes (7): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipImage(), BankSlipReviewActions(), getBankSlipReviewUrl()

### Community 83 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 84 - "audit/page.tsx"
Cohesion: 0.48
Nodes (6): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, parseAuditLogFilter()

### Community 85 - "5. Member 1 — Core infrastructure (critical path)"
Cohesion: 0.33
Nodes (6): 5. Member 1 — Core infrastructure (critical path), Blocker rule, Dependencies, Member 1 — Definition of done, Step-by-step plan (small slices), You are building

### Community 86 - "6. Member 2 — Buyer / storefront"
Cohesion: 0.33
Nodes (6): 6. Member 2 — Buyer / storefront, Dependencies, Member 2 — Agent sub-prompt example, Member 2 — Definition of done, Step-by-step plan, You are building

### Community 87 - "8. Member 4 — Admin, moderation, trust"
Cohesion: 0.33
Nodes (6): 8. Member 4 — Admin, moderation, trust, Dependencies, Member 4 — Critical security steps (never skip), Member 4 — Definition of done, Step-by-step plan, You are building

### Community 89 - "payhere-payment-status.tsx"
Cohesion: 0.50
Nodes (4): PayHerePaymentStatus(), PayHerePaymentStatusProps, pollPayHerePaymentStatusAction(), PaymentStatus

### Community 90 - "wishlist-list.tsx"
Cohesion: 0.50
Nodes (4): issueLabel(), WishlistList(), WishlistListProps, WishlistLine

### Community 91 - "3. Shared contracts (do not fork)"
Cohesion: 0.40
Nodes (5): 3. Shared contracts (do not fork), Agent rules every step, Minimum collections (Member 1 creates), Ownership of payments, Status enums

### Community 92 - "2. Technical stack (detail)"
Cohesion: 0.50
Nodes (4): 2. Technical stack (detail), Approved MCPs (agents), Suggested env (Member 1 defines `.env.example`), Suggested folder layout (Member 1 establishes; others follow)

### Community 93 - "sellers.ts"
Cohesion: 0.16
Nodes (14): ShopPage(), ShopPageProps, SellerInfoCard(), SellerInfoCardProps, asNullableString(), CheckoutSellerBankDetails, getPublicSellerBySlug(), getPublicSellerByUserId() (+6 more)

### Community 94 - "Member 3 — Seller portal"
Cohesion: 0.50
Nodes (4): Member 3 — Seller portal, Member 3 — verification extras, Step-by-step plan (implement one step at a time), Tasks

## Knowledge Gaps
- **476 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+471 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `assertRateLimit`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `config.ts`, `seller-listings.ts`, `dashboard/page.tsx`, `seller-application.ts`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `roles.ts`, `createAdminClient`, `seller-approvals.ts`, `edit-listing-form.tsx`, `wishlist.ts`, `profiles.ts`, `button.tsx`, `server.ts`, `storage.ts`, `ROLE_LABELS`, `appwrite/notifications.ts`, `free-order.ts`, `services/payhere.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `config.ts`, `seller-application.ts`, `notify-logs.ts`, `report-triage.ts`, `roles.ts`, `seller-approvals.ts`, `profiles.ts`, `admin-orders.ts`, `server.ts`, `trust-signals.ts`, `storage.ts`, `appwrite/notifications.ts`, `requireLabel`, `admin-metrics.ts`, `free-order.ts`, `listSellersWithFlags`, `sellers.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `portal-shell.tsx`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `seller-listings.ts`, `dashboard/page.tsx`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `roles.ts`, `getLoggedInUser`, `cn`, `types/index.ts`, `error-fallback.tsx`, `seller-approvals.ts`, `cart-contents.tsx`, `edit-listing-form.tsx`, `order-actions.ts`, `admin-orders.ts`, `server.ts`, `toast.ts`, `services/payhere.ts`, `bank-slips/page.tsx`, `audit/page.tsx`, `payhere-payment-status.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _476 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `portal-shell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `assertRateLimit` be split into smaller, more focused modules?**
  _Cohesion score 0.10099573257467995 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07619738751814223 - nodes in this community are weakly interconnected._