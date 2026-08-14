# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 220 files · ~96,449 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1701 nodes · 4631 edges · 98 communities (86 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c7aef562`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- store-navbar.tsx
- recovery.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- server.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- button.tsx
- free-order.ts
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
- user-management-actions.tsx
- dependencies
- profiles.ts
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (17)
- createAdminClient
- error-fallback.tsx
- seller-approvals.ts
- storage.ts
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
- getLoggedInUser
- config.ts
- toast.ts
- Agent reference docs
- devDependencies
- appwrite/notifications.ts
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
- requireLabel
- cart-contents.tsx
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
- services/index.ts
- seller-approval-actions.tsx
- rate-limit.ts
- (store)/layout.tsx
- products/[id]/page.tsx
- product-reviews-placeholder.tsx
- DATABASE_ID
- shop/[slug]/page.tsx
- seller-application-status.tsx
- getCart

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
- `SellerApproveButton()` --indirect_call--> `approveSellerApplication()`  [INFERRED]
  components/admin/seller-approval-actions.tsx → lib/appwrite/seller-approval-actions.ts
- `SellerRejectForm()` --indirect_call--> `rejectSellerApplication()`  [INFERRED]
  components/admin/seller-approval-actions.tsx → lib/appwrite/seller-approval-actions.ts
- `ForgotPasswordForm()` --indirect_call--> `requestPasswordRecovery()`  [INFERRED]
  components/auth/forgot-password-form.tsx → lib/appwrite/recovery.ts

## Import Cycles
- None detected.

## Communities (98 total, 12 thin omitted)

### Community 0 - "store-navbar.tsx"
Cohesion: 0.21
Nodes (11): StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 1 - "recovery.ts"
Cohesion: 0.26
Nodes (14): SearchParams, VerifyEmailPage(), initialState, ResendVerificationForm(), getAppUrl(), completeEmailVerification(), completePasswordRecovery(), mapRecoveryError() (+6 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (44): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+36 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "createSessionClient"
Cohesion: 0.29
Nodes (21): createSessionClient(), addToCart(), asCart(), asCartItem(), asNullableString(), asNumber(), assertCartMutationRateLimit(), cartPermissions() (+13 more)

### Community 5 - "types/index.ts"
Cohesion: 0.12
Nodes (34): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, CartView, Order (+26 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (35): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+27 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "server.ts"
Cohesion: 0.27
Nodes (10): ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), getAppwriteEndpoint(), getAppwriteProjectId(), getAvatarViewUrl(), getFilePreviewUrl() (+2 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.14
Nodes (14): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 4. How agents should work (all members), 9. Integration map (who waits on whom), Approved MCPs (agents) (+6 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "button.tsx"
Cohesion: 0.24
Nodes (11): CategoryPageProps, HomeProps, SearchPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS, ProductList(), ProductListProps (+3 more)

### Community 13 - "free-order.ts"
Cohesion: 0.09
Nodes (28): applyPaidSettlement(), GENERIC_FAILURE, loadAdminOrder(), loadAdminPaymentForOrder(), normalizeOrderId(), NOT_CONFIGURED, paymentAlreadyPaid(), evaluateFreeConfirm() (+20 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.15
Nodes (17): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrderListRow() (+9 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.13
Nodes (16): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+8 more)

### Community 17 - "products.ts"
Cohesion: 0.15
Nodes (23): CategoryPage(), Home(), SearchPage(), planStockDecrements(), asBoolean(), asNullableString(), asNumber(), asProduct() (+15 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.10
Nodes (29): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, isNotifyLogIssue() (+21 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.08
Nodes (26): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras (+18 more)

### Community 20 - "verify-payhere-notify.ts"
Cohesion: 0.11
Nodes (31): applySettle(), asNumber(), handlePayHereNotify(), header(), loadOrderPaymentItems(), ok(), paymentAlreadyPaid(), planStockDecrements() (+23 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "reviews.ts"
Cohesion: 0.18
Nodes (18): REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString(), asNumber(), asRating(), asReview(), assertReviewMutationRateLimit() (+10 more)

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
Cohesion: 0.07
Nodes (54): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+46 more)

### Community 27 - "user-management-actions.tsx"
Cohesion: 0.20
Nodes (16): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+8 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, dependencies, appwrite, class-variance-authority, lucide-react (+11 more)

### Community 29 - "profiles.ts"
Cohesion: 0.21
Nodes (16): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), BUCKET_AVATARS, asProfile(), createProfileForUser() (+8 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (57): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+49 more)

### Community 31 - "cn"
Cohesion: 0.18
Nodes (18): PortalNavItem, PortalShellProps, SideNav(), formatRelative(), NotificationBell(), Popover(), PopoverContent(), PopoverDescription() (+10 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.13
Nodes (23): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), FIELD_KEYS, FUNCTION_PAYHERE_CHECKOUT_HASH (+15 more)

### Community 33 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 34 - "createAdminClient"
Cohesion: 0.19
Nodes (22): GET(), createAdminClient(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists(), BankSlipReviewResult, clampLimit() (+14 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.18
Nodes (18): approveSellerApplication(), assertAdmin(), rejectSellerApplication(), revalidateSellerPaths(), AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString() (+10 more)

### Community 37 - "storage.ts"
Cohesion: 0.20
Nodes (18): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+10 more)

### Community 38 - "auth.ts"
Cohesion: 0.19
Nodes (16): RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState, mapAuthError(), readString() (+8 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.28
Nodes (15): TABLE_WISHLIST_ITEMS, addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine(), isProductInOwnWishlist(), listOwnWishlistItems() (+7 more)

### Community 40 - "admin/orders/page.tsx"
Cohesion: 0.21
Nodes (14): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+6 more)

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
Cohesion: 0.05
Nodes (77): LoginPage(), safeNextPath(), BecomeSellerPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage() (+69 more)

### Community 54 - "config.ts"
Cohesion: 0.13
Nodes (26): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_BANK_SLIPS, BUCKET_PRODUCT_IMAGES, PRODUCT_IMAGE_MAX_BYTES, SESSION_COOKIE (+18 more)

### Community 55 - "toast.ts"
Cohesion: 0.28
Nodes (6): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, WishlistLine

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "shop-profile-form.tsx"
Cohesion: 0.18
Nodes (16): initialState, SellerApplyForm(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts(), Label() (+8 more)

### Community 65 - "roles.ts"
Cohesion: 0.17
Nodes (18): RouteParams, SELLER_NAV, SellerLayout(), NavLinks(), requireUser(), ROLE_LABELS, RoleLabel, userHasLabel() (+10 more)

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "admin-metrics.ts"
Cohesion: 0.31
Nodes (11): AdminPage(), formatCount(), formatRevenue(), asNullableString(), asNumber(), countTableRows(), countUsers(), emptyMetrics() (+3 more)

### Community 71 - "requireLabel"
Cohesion: 0.17
Nodes (18): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, ADMIN_NAV, AdminLayout(), PortalShell() (+10 more)

### Community 72 - "cart-contents.tsx"
Cohesion: 0.21
Nodes (15): AddToCartButton(), AddToCartButtonProps, CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), addToCart(), clearCart() (+7 more)

### Community 73 - "sellers.ts"
Cohesion: 0.22
Nodes (10): SellerInfoCard(), SellerInfoCardProps, asNullableString(), CheckoutSellerBankDetails, getSellerBankDetailsForCheckout(), isApprovedPublicSellerStatus(), PublicSellerInfo, toPublicSellerInfo() (+2 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 80 - "forgot-password-form.tsx"
Cohesion: 0.20
Nodes (6): SearchParams, ForgotPasswordForm(), initialState, initialState, ResetPasswordForm(), RecoveryActionState

### Community 81 - "admin-orders.ts"
Cohesion: 0.27
Nodes (15): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), ListAllOrdersResult (+7 more)

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

### Community 88 - "services/index.ts"
Cohesion: 0.29
Nodes (10): WishlistToggleButton(), WishlistToggleButtonProps, AdminMetrics, addToWishlist(), removeFromWishlist(), revalidateWishlistPaths(), toggleWishlistProduct(), WISHLIST_ERROR_CODES (+2 more)

### Community 89 - "seller-approval-actions.tsx"
Cohesion: 0.23
Nodes (11): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+3 more)

### Community 90 - "rate-limit.ts"
Cohesion: 0.20
Nodes (9): BucketHits, peekRateLimit(), pruneIfNeeded(), RATE_LIMIT_MESSAGE, RATE_LIMITS, RateLimitBlocked, RateLimitOk, RateLimitResult (+1 more)

### Community 91 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 92 - "products/[id]/page.tsx"
Cohesion: 0.36
Nodes (8): ProductPage(), ProductPageProps, WishlistPage(), getProduct(), listProductImages(), canReviewProduct(), listProductReviews(), getOwnWishlistView()

### Community 93 - "product-reviews-placeholder.tsx"
Cohesion: 0.27
Nodes (6): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, createProductReview(), revalidateReviewPaths(), CreateProductReviewInput, Review

### Community 94 - "DATABASE_ID"
Cohesion: 0.25
Nodes (7): DATABASE_ID, assert(), mapped, systemMapped, systemRow, validRow, verifyAppwriteLockdown()

### Community 95 - "shop/[slug]/page.tsx"
Cohesion: 0.43
Nodes (5): SellerShopPage(), ShopPage(), ShopPageProps, getShopBannerPreviewUrl(), getPublicSellerBySlug()

### Community 96 - "seller-application-status.tsx"
Cohesion: 0.38
Nodes (5): SellerApplicationStatus(), SellerApplicationStatusProps, Badge(), badgeVariants, SellerProfile

### Community 97 - "getCart"
Cohesion: 0.40
Nodes (5): CartPage(), CartContents(), buildCartLine(), getCart(), resolveLineIssue()

## Knowledge Gaps
- **442 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `recovery.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `free-order.ts`, `dashboard/page.tsx`, `seller-application.ts`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management-actions.tsx`, `profiles.ts`, `types/payhere.ts`, `createAdminClient`, `seller-approvals.ts`, `storage.ts`, `auth.ts`, `wishlist.ts`, `config.ts`, `appwrite/notifications.ts`, `roles.ts`, `(store)/layout.tsx`, `products/[id]/page.tsx`, `getCart`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `server.ts`, `free-order.ts`, `seller-application.ts`, `products.ts`, `notify-logs.ts`, `report-triage.ts`, `user-management-actions.tsx`, `profiles.ts`, `trust-signals.ts`, `seller-approvals.ts`, `storage.ts`, `auth.ts`, `config.ts`, `appwrite/notifications.ts`, `roles.ts`, `admin-metrics.ts`, `requireLabel`, `sellers.ts`, `admin-orders.ts`, `seller-approval-actions.tsx`, `DATABASE_ID`, `shop/[slug]/page.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `store-navbar.tsx`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `dashboard/page.tsx`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management-actions.tsx`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `admin/orders/page.tsx`, `getLoggedInUser`, `toast.ts`, `shop-profile-form.tsx`, `requireLabel`, `cart-contents.tsx`, `services/index.ts`, `seller-approval-actions.tsx`, `products/[id]/page.tsx`, `product-reviews-placeholder.tsx`, `getCart`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0792156862745098 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11561561561561562 - nodes in this community are weakly interconnected._