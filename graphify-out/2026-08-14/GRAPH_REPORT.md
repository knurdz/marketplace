# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 221 files · ~97,883 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1723 nodes · 4682 edges · 93 communities (81 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `479a0f0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- button.tsx
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
- product-catalog-filters.tsx
- free-order.ts
- compilerOptions
- admin/orders/page.tsx
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
- Tables (18)
- createAdminClient
- error-fallback.tsx
- seller-approvals.ts
- storage.ts
- auth.ts
- wishlist.ts
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
- platform-settings-manager.tsx
- order-actions.ts
- config.ts
- user-management.ts
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
- bank-slips/page.tsx
- services/index.ts
- node-appwrite
- app/layout.tsx
- shadcn
- react
- tw-animate-css
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- orders.ts
- users/page.tsx
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- 3. Shared contracts (do not fork)
- 7. Member 3 — Seller portal
- class-variance-authority
- seller-approval-actions.tsx
- assertRateLimit
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
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SettingFieldForm()` --indirect_call--> `updatePlatformSettingFormAction()`  [INFERRED]
  components/admin/platform-settings-manager.tsx → lib/appwrite/platform-settings-actions.ts
- `SellerApplyForm()` --indirect_call--> `submitSellerApplication()`  [INFERRED]
  components/seller/seller-apply-form.tsx → lib/appwrite/seller-application-actions.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (93 total, 12 thin omitted)

### Community 0 - "button.tsx"
Cohesion: 0.18
Nodes (16): PortalNavItem, PortalShellProps, StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Button(), buttonVariants, Sheet() (+8 more)

### Community 1 - "recovery.ts"
Cohesion: 0.14
Nodes (19): SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, ResendVerificationForm(), initialState (+11 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.11
Nodes (31): AdminSettingsPage(), PlatformSettingsManager(), ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, assertAdminUser(), BOOLEAN_KEYS, findSettingByKey() (+23 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "createSessionClient"
Cohesion: 0.11
Nodes (43): CartPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+35 more)

### Community 5 - "types/index.ts"
Cohesion: 0.10
Nodes (33): PayHerePaymentStatusProps, AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, Order (+25 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.12
Nodes (30): initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm(), ListingRowActions(), ListingRowActionsProps, useModerationToast() (+22 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "server.ts"
Cohesion: 0.29
Nodes (10): ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), getAppwriteEndpoint(), getAppwriteProjectId(), getAvatarPreviewUrl(), getAvatarViewUrl() (+2 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.10
Nodes (20): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path), 9. Integration map (who waits on whom) (+12 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "product-catalog-filters.tsx"
Cohesion: 0.15
Nodes (17): CategoryPage(), CategoryPageProps, Home(), HomeProps, ShopPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS (+9 more)

### Community 13 - "free-order.ts"
Cohesion: 0.10
Nodes (30): adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems(), loadAdminPaymentForOrder(), normalizeOrderId() (+22 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "admin/orders/page.tsx"
Cohesion: 0.15
Nodes (20): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+12 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.13
Nodes (17): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+9 more)

### Community 17 - "products.ts"
Cohesion: 0.21
Nodes (16): SearchPage(), SearchPageProps, asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage(), buildProductCatalogQueries() (+8 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.10
Nodes (34): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, isNotifyLogIssue() (+26 more)

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
Nodes (18): REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString(), asNumber(), asRating(), asReview(), assertReviewMutationRateLimit() (+10 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.27
Nodes (13): BankSlipApproveButton(), BankSlipRejectForm(), initial, useBankSlipToast(), approveBankSlip(), approveBankSlipFormAction(), assertAdmin(), BankSlipActionState (+5 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "report-triage.ts"
Cohesion: 0.07
Nodes (55): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, initial, ReportDetails(), ReportDismissForm() (+47 more)

### Community 27 - "user-management-actions.tsx"
Cohesion: 0.29
Nodes (11): suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm(), UserSuspendFormProps, UserUnsuspendButton(), assertAdmin(), revalidateUserPaths() (+3 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, clsx, lucide-react, next, dependencies, appwrite, clsx, lucide-react (+11 more)

### Community 29 - "profiles.ts"
Cohesion: 0.26
Nodes (13): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), getOwnProfile(), Profile (+5 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (57): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+49 more)

### Community 31 - "cn"
Cohesion: 0.17
Nodes (18): SideNav(), formatRelative(), NotificationBell(), Badge(), badgeVariants, Label(), Popover(), PopoverContent() (+10 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.11
Nodes (26): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+18 more)

### Community 33 - "Tables (18)"
Cohesion: 0.11
Nodes (19): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+11 more)

### Community 34 - "createAdminClient"
Cohesion: 0.20
Nodes (19): GET(), RouteParams, createAdminClient(), deleteFileAsAdmin(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists() (+11 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.21
Nodes (14): AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), asSellerProfile(), loadSellerProfileRow(), maskBankAccountNumber(), mergeSellerLabel() (+6 more)

### Community 37 - "storage.ts"
Cohesion: 0.22
Nodes (16): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), extensionOf(), publicImagePermissions(), toInputFile() (+8 more)

### Community 38 - "auth.ts"
Cohesion: 0.19
Nodes (16): RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState, mapAuthError(), readString() (+8 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.08
Nodes (40): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), WishlistPage() (+32 more)

### Community 40 - "getLoggedInUser"
Cohesion: 0.14
Nodes (27): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage(), PayHereCancelPage() (+19 more)

### Community 41 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.11
Nodes (18): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function, Next.js client (+10 more)

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

### Community 51 - "platform-settings-manager.tsx"
Cohesion: 0.19
Nodes (10): BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManagerProps, SettingFieldForm(), useSettingToast(), initialState (+2 more)

### Community 52 - "order-actions.ts"
Cohesion: 0.09
Nodes (33): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmForm() (+25 more)

### Community 54 - "config.ts"
Cohesion: 0.12
Nodes (27): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, BUCKET_PRODUCT_IMAGES, PRODUCT_IMAGE_MAX_BYTES (+19 more)

### Community 55 - "user-management.ts"
Cohesion: 0.39
Nodes (8): AdminUserView, assertCanModifyTarget(), loadTargetUser(), suspendUserCore(), unsuspendUserCore(), UserListResult, UserManagementResult, writeAuditLog()

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
Nodes (18): SellerShopPage(), ShopPage(), bannerInitial, profileInitial, ShopProfileForm(), ShopProfileFormProps, useActionToasts(), readString() (+10 more)

### Community 65 - "roles.ts"
Cohesion: 0.16
Nodes (17): SELLER_NAV, SellerLayout(), BecomeSellerPage(), NavLinks(), SellerApplicationStatus(), SellerApplicationStatusProps, SellerApplyForm(), assertAdmin() (+9 more)

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

### Community 72 - "bank-slips/page.tsx"
Cohesion: 0.36
Nodes (7): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipImage(), BankSlipReviewActions(), getBankSlipReviewUrl()

### Community 73 - "services/index.ts"
Cohesion: 0.17
Nodes (19): AdminListingsPage(), formatPrice(), PageProps, SellerInfoCard(), SellerInfoCardProps, AdminMetrics, AdminOrderView, ListAllOrdersResult (+11 more)

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 80 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 81 - "orders.ts"
Cohesion: 0.15
Nodes (29): adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), listOrdersDirect(), listOrdersFromPayments() (+21 more)

### Community 82 - "users/page.tsx"
Cohesion: 0.43
Nodes (6): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, listUsers(), toAdminUserView()

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
Cohesion: 0.21
Nodes (15): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+7 more)

### Community 90 - "assertRateLimit"
Cohesion: 0.19
Nodes (12): assertRateLimit(), assertRateLimits(), BucketHits, peekRateLimit(), pruneIfNeeded(), RATE_LIMIT_MESSAGE, RATE_LIMITS, RateLimitBlocked (+4 more)

### Community 91 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 93 - "products/[id]/page.tsx"
Cohesion: 0.19
Nodes (10): ProductPage(), ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, createProductReview(), revalidateReviewPaths(), canReviewProduct(), CreateProductReviewInput (+2 more)

### Community 94 - "DATABASE_ID"
Cohesion: 0.25
Nodes (7): DATABASE_ID, assert(), mapped, systemMapped, systemRow, validRow, verifyAppwriteLockdown()

## Knowledge Gaps
- **449 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+444 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `recovery.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `product-catalog-filters.tsx`, `free-order.ts`, `seller-application.ts`, `reviews.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management-actions.tsx`, `profiles.ts`, `types/payhere.ts`, `createAdminClient`, `storage.ts`, `auth.ts`, `wishlist.ts`, `config.ts`, `appwrite/notifications.ts`, `shop-profile-form.tsx`, `roles.ts`, `orders.ts`, `seller-approval-actions.tsx`, `(store)/layout.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `server.ts`, `free-order.ts`, `seller-application.ts`, `notify-logs.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `profiles.ts`, `trust-signals.ts`, `seller-approvals.ts`, `storage.ts`, `auth.ts`, `config.ts`, `user-management.ts`, `appwrite/notifications.ts`, `admin-metrics.ts`, `requireLabel`, `services/index.ts`, `orders.ts`, `users/page.tsx`, `seller-approval-actions.tsx`, `DATABASE_ID`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `categories.ts`, `createSessionClient`, `types/index.ts`, `listing-moderation.ts`, `product-catalog-filters.tsx`, `admin/orders/page.tsx`, `products.ts`, `bank-slip-actions.ts`, `report-triage.ts`, `user-management-actions.tsx`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `wishlist.ts`, `getLoggedInUser`, `platform-settings-manager.tsx`, `order-actions.ts`, `shop-profile-form.tsx`, `requireLabel`, `bank-slips/page.tsx`, `users/page.tsx`, `seller-approval-actions.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _449 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `recovery.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1126984126984127 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._