# Graph Report - knurdz-marketplace  (2026-08-15)

## Corpus Check
- 232 files · ~105,582 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1837 nodes · 5092 edges · 103 communities (90 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b71c65fb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (store)/layout.tsx
- auth.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation-actions.ts
- admin-analytics.ts
- config.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- seller-listings.ts
- free-order-rules.ts
- compilerOptions
- order-display.ts
- seller-application.ts
- search/page.tsx
- notify-logs.ts
- Work Distribution — Knurdz Marketplace
- verify-payhere-notify.ts
- components.json
- hasAppwritePublicConfig
- bank-slip-actions.ts
- devDependencies
- seed-demo.mjs
- report-triage.ts
- roles.ts
- dependencies
- getLoggedInUser
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (18)
- bank-slip-review.ts
- error-fallback.tsx
- seller-approval-actions.tsx
- cart-contents.tsx
- edit-listing-form.tsx
- wishlist.ts
- orders.ts
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
- admin/orders/page.tsx
- user-management-actions.tsx
- products/[id]/page.tsx
- Agent reference docs
- devDependencies
- buildEvaluationBundle
- package.json
- shadcn
- AGENTS.md
- seller-metrics.ts
- storage.ts
- eslint.config.mjs
- ROLE_LABELS
- next.config.ts
- payhere-checkout-hash/package.json
- postcss.config.mjs
- payhere-notify/package.json
- appwrite/notifications.ts
- audit-logs.ts
- admin-metrics.ts
- free-order.ts
- node-appwrite
- app/layout.tsx
- shadcn
- requireLabel
- tw-animate-css
- notify-logs/page.tsx
- seller-approvals.ts
- services/index.ts
- bank-slips/page.tsx
- Member 1 — Foundation (must-dos first)
- confirmFreeOrder
- admin-orders.ts
- seller-application-actions.ts
- createAdminClient
- clsx
- userHasLabel
- dashboard/page.tsx
- orders/[id]/page.tsx
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- sellers.ts
- Sandbox demo (step 1.27)
- Order
- Notify Function
- Hash Function
- seller/layout.tsx
- getCart
- Member 4 — Admin, moderation, trust
- listOwnOrders
- react

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 111 edges
2. `createAdminClient()` - 94 edges
3. `createSessionClient()` - 86 edges
4. `hasAppwritePublicConfig()` - 79 edges
5. `Button()` - 51 edges
6. `userHasLabel()` - 40 edges
7. `assertRateLimit()` - 32 edges
8. `DATABASE_ID` - 31 edges
9. `cn()` - 31 edges
10. `getOwnOrder()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SettingFieldForm()` --indirect_call--> `updatePlatformSettingFormAction()`  [INFERRED]
  components/admin/platform-settings-manager.tsx → lib/appwrite/platform-settings-actions.ts
- `LoginForm()` --indirect_call--> `signInWithEmail()`  [INFERRED]
  components/auth/login-form.tsx → lib/appwrite/auth.ts
- `RegisterForm()` --indirect_call--> `signUpWithEmail()`  [INFERRED]
  components/auth/register-form.tsx → lib/appwrite/auth.ts
- `CreateListingForm()` --indirect_call--> `createDraftListing()`  [INFERRED]
  components/seller/create-listing-form.tsx → lib/appwrite/seller-listing-actions.ts

## Import Cycles
- None detected.

## Communities (103 total, 13 thin omitted)

### Community 0 - "(store)/layout.tsx"
Cohesion: 0.25
Nodes (6): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar(), getCartItemCount()

### Community 1 - "auth.ts"
Cohesion: 0.08
Nodes (37): SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, ResendVerificationForm(), initialState (+29 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.11
Nodes (32): AdminSettingsPage(), PlatformSettingsManager(), ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, assertAdminUser(), BOOLEAN_KEYS, findSettingByKey() (+24 more)

### Community 3 - "categories.ts"
Cohesion: 0.08
Nodes (50): AdminCategoriesPage(), NewListingPage(), formatPrice(), SellerListingsPage(), CategoriesPage(), CategoriesManager(), CategoryRow(), CreateCategoryForm() (+42 more)

### Community 4 - "createSessionClient"
Cohesion: 0.27
Nodes (22): createSessionClient(), addToCart(), asCart(), asCartItem(), asNullableString(), asNumber(), assertCartMutationRateLimit(), buildCartLine() (+14 more)

### Community 5 - "types/index.ts"
Cohesion: 0.12
Nodes (32): Cart, CartItem, CartLine, CartLineIssue, Report, Review, WishlistItem, WishlistLineIssue (+24 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation-actions.ts"
Cohesion: 0.12
Nodes (30): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+22 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "config.ts"
Cohesion: 0.13
Nodes (28): getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_EXTENSIONS, BANK_SLIP_MAX_BYTES, BANK_SLIP_MIME_TYPES (+20 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "seller-listings.ts"
Cohesion: 0.11
Nodes (37): EditListingPage(), EditListingPageProps, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, PRODUCT_IMAGE_MAX_BYTES, assertRateLimit(), listProductImages(), addOwnProductImagesCore() (+29 more)

### Community 13 - "free-order-rules.ts"
Cohesion: 0.13
Nodes (19): applyPaidSettlement(), evaluateFreeConfirm(), FREE_CONFIRM_CLOSED, FREE_CONFIRM_NO_ITEMS, FREE_CONFIRM_NOT_FOUND, FREE_CONFIRM_NOT_FREE, FREE_CONFIRM_STOCK, FREE_CONFIRM_WRONG_STATE (+11 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "order-display.ts"
Cohesion: 0.23
Nodes (11): OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod(), ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS (+3 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.13
Nodes (18): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+10 more)

### Community 17 - "search/page.tsx"
Cohesion: 0.13
Nodes (23): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ShopPage(), ShopPageProps (+15 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.14
Nodes (22): isNotifyLogIssue(), ISSUE_OUTCOMES, NOTIFY_LOG_OUTCOMES, ParsedNotifyLog, parseNotifyLogText(), redactNotifyLogText(), adminSdkAvailable(), appwriteCode() (+14 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.08
Nodes (44): compactString(), NOTIFY_PAYLOAD_ALLOWLIST, notifyLogRowFromDecision(), notifyLogRowHasSecret(), sanitizeNotifyPayload(), applySettle(), asNumber(), handlePayHereNotify() (+36 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "hasAppwritePublicConfig"
Cohesion: 0.12
Nodes (29): ProductPage(), hasAppwritePublicConfig(), createProductReview(), revalidateReviewPaths(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString() (+21 more)

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
Cohesion: 0.09
Nodes (43): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+35 more)

### Community 27 - "roles.ts"
Cohesion: 0.18
Nodes (14): LoginPage(), RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState, homePathForUser() (+6 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, dependencies, appwrite, class-variance-authority, lucide-react (+11 more)

### Community 29 - "getLoggedInUser"
Cohesion: 0.21
Nodes (17): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage() (+9 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.11
Nodes (29): FlaggedSellerRow, SellerEvaluationBundle, SellerTrustSignals, VerifiedSellerRow, BadgeEligibilityResult, CANCELLATION_RATE_THRESHOLD, daysSince(), evaluateBadgeEligibility() (+21 more)

### Community 31 - "cn"
Cohesion: 0.12
Nodes (28): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, formatRelative(), NotificationBell(), ReportListingButtonProps, Badge() (+20 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.12
Nodes (24): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+16 more)

### Community 33 - "Tables (18)"
Cohesion: 0.11
Nodes (19): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+11 more)

### Community 34 - "bank-slip-review.ts"
Cohesion: 0.17
Nodes (19): adminSdkAvailable(), approveBankSlipCore(), asNullableString(), BankSlipReviewResult, clampLimit(), isAlreadyProcessed(), listPendingBankSlips(), ListPendingBankSlipsResult (+11 more)

### Community 36 - "seller-approval-actions.tsx"
Cohesion: 0.21
Nodes (15): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+7 more)

### Community 37 - "cart-contents.tsx"
Cohesion: 0.26
Nodes (13): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), addToCart() (+5 more)

### Community 38 - "edit-listing-form.tsx"
Cohesion: 0.20
Nodes (20): DeleteImageButton(), EditListingForm(), EditListingFormProps, initial, useActionToasts(), initial, SubmitListingButton(), SubmitListingButtonProps (+12 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.31
Nodes (12): TABLE_WISHLIST_ITEMS, addToOwnWishlist(), assertWishlistMutationRateLimit(), buildWishlistLine(), mapWishlistError(), notConfiguredState(), removeFromOwnWishlist(), requireUser() (+4 more)

### Community 40 - "orders.ts"
Cohesion: 0.15
Nodes (25): CancelOrderActionState, CancelOrderResult, ConfirmFreeOrderActionState, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode (+17 more)

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

### Community 46 - "profiles.ts"
Cohesion: 0.14
Nodes (21): AccountPage(), WishlistPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps (+13 more)

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
Cohesion: 0.08
Nodes (33): CategoriesManagerProps, CategoryRowProps, initial, BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManagerProps (+25 more)

### Community 52 - "admin/orders/page.tsx"
Cohesion: 0.29
Nodes (11): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+3 more)

### Community 54 - "user-management-actions.tsx"
Cohesion: 0.21
Nodes (15): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+7 more)

### Community 55 - "products/[id]/page.tsx"
Cohesion: 0.20
Nodes (7): ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, ReportListingButton(), WishlistToggleButton(), WishlistToggleButtonProps, createProductReport()

### Community 56 - "Agent reference docs"
Cohesion: 0.33
Nodes (6): Agent reference docs, By member, Non-negotiables, Payment setup status, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "buildEvaluationBundle"
Cohesion: 0.18
Nodes (17): asBankSlip(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller(), fetchOpenReportsForProductIds(), fetchOrdersForSellerIds(), fetchProductIdsForSellers() (+9 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 62 - "seller-metrics.ts"
Cohesion: 0.20
Nodes (15): formatCount(), formatRevenue(), SellerPage(), aggregateSellerRevenue(), asNullableString(), asNumber(), countSellerOrders(), emptyMetrics() (+7 more)

### Community 63 - "storage.ts"
Cohesion: 0.27
Nodes (14): bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf(), publicImagePermissions(), toInputFile(), uploadAvatar(), uploadBankSlip() (+6 more)

### Community 65 - "ROLE_LABELS"
Cohesion: 0.29
Nodes (7): SellerShopPage(), BecomeSellerPage(), SellerApplicationStatus(), SellerApplicationStatusProps, ROLE_LABELS, getShopBannerPreviewUrl(), getOwnSellerProfile()

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 71 - "audit-logs.ts"
Cohesion: 0.13
Nodes (21): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, adminSdkAvailable(), asAuditLogEntry(), asNullableString() (+13 more)

### Community 72 - "admin-metrics.ts"
Cohesion: 0.27
Nodes (12): AdminPage(), formatCount(), formatRevenue(), AdminMetrics, asNullableString(), asNumber(), countTableRows(), countUsers() (+4 more)

### Community 73 - "free-order.ts"
Cohesion: 0.09
Nodes (34): DATABASE_ID, TABLE_AUDIT_LOGS, TABLE_ORDER_ITEMS, TABLE_ORDERS, TABLE_PAYMENTS, TABLE_PRODUCT_IMAGES, TABLE_PRODUCTS, TABLE_REPORTS (+26 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 77 - "requireLabel"
Cohesion: 0.18
Nodes (17): ADMIN_NAV, AdminLayout(), AdminTrustPage(), RULE_LABELS, ruleLabel(), PortalShell(), requireLabel(), adminSdkAvailable() (+9 more)

### Community 79 - "notify-logs/page.tsx"
Cohesion: 0.21
Nodes (12): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, NotifyLogOutcome (+4 more)

### Community 80 - "seller-approvals.ts"
Cohesion: 0.19
Nodes (15): TABLE_SELLER_PROFILES, AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), asSellerProfile(), loadSellerProfileRow(), maskBankAccountNumber() (+7 more)

### Community 81 - "services/index.ts"
Cohesion: 0.12
Nodes (22): AdminOrderView, ListAllOrdersResult, CART_ERROR_CODES, CartActionState, CartErrorCode, ProductCatalogParams, ProductCatalogSort, REPORT_ERROR_CODES (+14 more)

### Community 82 - "bank-slips/page.tsx"
Cohesion: 0.36
Nodes (7): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipImage(), BankSlipReviewActions(), getBankSlipReviewUrl()

### Community 83 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 84 - "confirmFreeOrder"
Cohesion: 0.16
Nodes (13): BankSlipUploadForm(), FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, adminSdkAvailable(), confirmFreeOrder(), loadAdminPaymentForOrder(), normalizeOrderId() (+5 more)

### Community 85 - "admin-orders.ts"
Cohesion: 0.33
Nodes (13): adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), listOrdersDirect(), listOrdersFromPayments() (+5 more)

### Community 86 - "seller-application-actions.ts"
Cohesion: 0.23
Nodes (12): SellerApplyForm(), ShopProfileForm(), useActionToasts(), readString(), revalidateShopPaths(), SellerApplicationActionState, ShopProfileActionState, submitSellerApplication() (+4 more)

### Community 87 - "createAdminClient"
Cohesion: 0.31
Nodes (12): createAdminClient(), loadAdminOrder(), AdminUserView, assertCanModifyTarget(), listUsers(), loadTargetUser(), suspendUserCore(), toAdminUserView() (+4 more)

### Community 89 - "userHasLabel"
Cohesion: 0.26
Nodes (10): GET(), RouteParams, NavLinks(), assertAdmin(), PlatformSettingActionState, revalidateSettingsPath(), updatePlatformSetting(), updatePlatformSettingFormAction() (+2 more)

### Community 90 - "dashboard/page.tsx"
Cohesion: 0.18
Nodes (12): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), issueLabel() (+4 more)

### Community 91 - "orders/[id]/page.tsx"
Cohesion: 0.25
Nodes (9): OrderDetailPage(), OrderDetailPageProps, initialState, OrderCancelForm(), OrderCancelFormProps, cancelOrderAction(), revalidateOrderPaths(), getOwnOrderItems() (+1 more)

### Community 92 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 93 - "sellers.ts"
Cohesion: 0.22
Nodes (10): SellerInfoCard(), SellerInfoCardProps, asNullableString(), CheckoutSellerBankDetails, getSellerBankDetailsForCheckout(), isApprovedPublicSellerStatus(), PublicSellerInfo, toPublicSellerInfo() (+2 more)

### Community 94 - "Sandbox demo (step 1.27)"
Cohesion: 0.29
Nodes (7): Decline, cancel, idempotency, Free path (seeded), Happy path (PayHere), Local Next.js vs `notify_url`, Prerequisites, Sandbox demo (step 1.27), Test cards (sandbox only)

### Community 95 - "Order"
Cohesion: 0.29
Nodes (4): Order, empty, mixed, onlyUnpaid

### Community 96 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 97 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (this Function — Member 1 step 1.22)

### Community 98 - "seller/layout.tsx"
Cohesion: 0.60
Nodes (4): SELLER_NAV, SellerLayout(), requireUser(), blockedSellerPortalDestination

### Community 99 - "getCart"
Cohesion: 0.67
Nodes (3): CartPage(), CheckoutPage(), getCart()

### Community 100 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

## Knowledge Gaps
- **479 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+474 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `(store)/layout.tsx`, `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation-actions.ts`, `config.ts`, `seller-listings.ts`, `seller-application.ts`, `hasAppwritePublicConfig`, `bank-slip-actions.ts`, `report-triage.ts`, `roles.ts`, `types/payhere.ts`, `seller-approval-actions.tsx`, `wishlist.ts`, `orders.ts`, `profiles.ts`, `button.tsx`, `user-management-actions.tsx`, `products/[id]/page.tsx`, `seller-metrics.ts`, `storage.ts`, `ROLE_LABELS`, `appwrite/notifications.ts`, `free-order.ts`, `confirmFreeOrder`, `seller-application-actions.ts`, `userHasLabel`, `dashboard/page.tsx`, `orders/[id]/page.tsx`, `seller/layout.tsx`, `getCart`, `listOwnOrders`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `categories.ts`, `listing-moderation-actions.ts`, `seller-listings.ts`, `search/page.tsx`, `bank-slip-actions.ts`, `report-triage.ts`, `getLoggedInUser`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `seller-approval-actions.tsx`, `cart-contents.tsx`, `edit-listing-form.tsx`, `profiles.ts`, `admin/orders/page.tsx`, `user-management-actions.tsx`, `products/[id]/page.tsx`, `audit-logs.ts`, `bank-slips/page.tsx`, `confirmFreeOrder`, `dashboard/page.tsx`, `orders/[id]/page.tsx`, `getCart`, `listOwnOrders`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `hasAppwritePublicConfig()` connect `hasAppwritePublicConfig` to `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation-actions.ts`, `admin-analytics.ts`, `config.ts`, `seller-listings.ts`, `seller-application.ts`, `search/page.tsx`, `notify-logs.ts`, `report-triage.ts`, `getLoggedInUser`, `trust-signals.ts`, `types/payhere.ts`, `bank-slip-review.ts`, `seller-approval-actions.tsx`, `wishlist.ts`, `orders.ts`, `seller-metrics.ts`, `audit-logs.ts`, `admin-metrics.ts`, `free-order.ts`, `requireLabel`, `seller-approvals.ts`, `confirmFreeOrder`, `admin-orders.ts`, `seller-application-actions.ts`, `createAdminClient`, `listOwnOrders`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _479 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10810810810810811 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07644110275689223 - nodes in this community are weakly interconnected._