# Graph Report - knurdz-marketplace  (2026-08-15)

## Corpus Check
- 228 files · ~102,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1783 nodes · 4887 edges · 89 communities (77 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `54f1b1f0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- store-navbar.tsx
- auth.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation-actions.ts
- admin-analytics.ts
- report-triage.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- verify-payhere-checkout-hash.ts
- seller-listings.ts
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
- bank-slip-review-actions.tsx
- devDependencies
- seed-demo.mjs
- report-triage-actions.tsx
- user-management-actions.tsx
- dependencies
- getLoggedInUser
- trust-signals.ts
- cn
- types/payhere.ts
- Tables (18)
- createAdminClient
- error-fallback.tsx
- seller-approvals.ts
- cart-contents.tsx
- reports.ts
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
- button.tsx
- admin-orders.ts
- appwrite/index.ts
- wishlist/page.tsx
- Agent reference docs
- devDependencies
- listing-moderation.ts
- package.json
- shadcn
- AGENTS.md
- seller-application-actions.ts
- eslint.config.mjs
- roles.ts
- next.config.ts
- payhere-checkout-hash/package.json
- postcss.config.mjs
- payhere-notify/package.json
- reports/page.tsx
- userHasLabel
- user-management.ts
- admin/listings/page.tsx
- node-appwrite
- app/layout.tsx
- shadcn
- Sandbox demo (step 1.27)
- tw-animate-css
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- users/page.tsx
- services/index.ts
- Hash Function
- Member 1 — Foundation (must-dos first)
- Member 4 — Admin, moderation, trust
- react
- clsx
- (store)/layout.tsx
- products/[id]/page.tsx

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 108 edges
2. `createAdminClient()` - 94 edges
3. `hasAppwritePublicConfig()` - 76 edges
4. `createSessionClient()` - 76 edges
5. `Button()` - 49 edges
6. `userHasLabel()` - 39 edges
7. `cn()` - 31 edges
8. `DATABASE_ID` - 30 edges
9. `assertRateLimit()` - 28 edges
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
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (89 total, 12 thin omitted)

### Community 0 - "store-navbar.tsx"
Cohesion: 0.18
Nodes (13): StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+5 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (45): LoginPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+37 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (45): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+37 more)

### Community 3 - "categories.ts"
Cohesion: 0.10
Nodes (45): AdminCategoriesPage(), NewListingPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm() (+37 more)

### Community 4 - "createSessionClient"
Cohesion: 0.26
Nodes (23): createSessionClient(), addToCart(), asCart(), asCartItem(), asNullableString(), asNumber(), assertCartMutationRateLimit(), buildCartLine() (+15 more)

### Community 5 - "types/index.ts"
Cohesion: 0.11
Nodes (34): SellerApplicationStatus(), SellerApplicationStatusProps, BankSlip, Cart, CartItem, CartLine, CartLineIssue, Category (+26 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (39): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+31 more)

### Community 7 - "listing-moderation-actions.ts"
Cohesion: 0.26
Nodes (15): initial, ListingApproveButton(), ListingRejectForm(), ListingRemoveForm(), ListingRowActionsProps, useModerationToast(), approveListing(), approveListingFormAction() (+7 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "report-triage.ts"
Cohesion: 0.17
Nodes (15): TABLE_REPORTS, planStockDecrements(), asProduct(), AdminReportView, adminSdkAvailable(), asCreatedAt(), DISMISSED_STATUS, listReports() (+7 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "verify-payhere-checkout-hash.ts"
Cohesion: 0.09
Nodes (37): buildCheckoutUrls(), checkoutActionUrl(), computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), formatPayHereAmount(), isSandboxEnv(), itemsDescription(), md5Upper() (+29 more)

### Community 12 - "seller-listings.ts"
Cohesion: 0.09
Nodes (34): formatPrice(), SellerListingsPage(), initial, SubmitListingButton(), SubmitListingButtonProps, TABLE_CATEGORIES, createDraftListing(), CreateListingActionState (+26 more)

### Community 13 - "free-order.ts"
Cohesion: 0.08
Nodes (39): TABLE_ORDER_ITEMS, fetchPaymentsByOrderIds(), adminSdkAvailable(), applyPaidSettlement(), confirmFreeOrder(), GENERIC_FAILURE, loadAdminOrder(), loadAdminOrderItems() (+31 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (23): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrderDetailPage() (+15 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.13
Nodes (17): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+9 more)

### Community 17 - "products.ts"
Cohesion: 0.10
Nodes (32): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ShopPage(), ShopPageProps (+24 more)

### Community 18 - "notify-logs.ts"
Cohesion: 0.09
Nodes (35): AdminNotifyLogsPage(), formatCreatedAt(), formatDuration(), OUTCOME_LABELS, PageProps, SOURCE_EMPTY, VIEW_TABS, TABLE_PAYHERE_NOTIFY_LOGS (+27 more)

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
Cohesion: 0.15
Nodes (23): ProductPage(), TABLE_REVIEWS, getProduct(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString(), asNumber() (+15 more)

### Community 23 - "bank-slip-review-actions.tsx"
Cohesion: 0.20
Nodes (14): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+6 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.16
Nodes (21): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+13 more)

### Community 26 - "report-triage-actions.tsx"
Cohesion: 0.18
Nodes (22): initial, ReportDismissForm(), ReportNoteForm(), ReportResolveForm(), ReportStartReviewButton(), useTriageToast(), assertAdmin(), dismissReport() (+14 more)

### Community 27 - "user-management-actions.tsx"
Cohesion: 0.29
Nodes (11): suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm(), UserSuspendFormProps, UserUnsuspendButton(), assertAdmin(), revalidateUserPaths() (+3 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, dependencies, appwrite, class-variance-authority, lucide-react (+11 more)

### Community 29 - "getLoggedInUser"
Cohesion: 0.17
Nodes (19): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps (+11 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.05
Nodes (74): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, AdminTrustPage(), RULE_LABELS, ruleLabel() (+66 more)

### Community 31 - "cn"
Cohesion: 0.19
Nodes (18): PortalNavItem, PortalShellProps, SideNav(), formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover() (+10 more)

### Community 32 - "types/payhere.ts"
Cohesion: 0.13
Nodes (24): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), FIELD_KEYS, FUNCTION_PAYHERE_CHECKOUT_HASH (+16 more)

### Community 33 - "Tables (18)"
Cohesion: 0.11
Nodes (19): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+11 more)

### Community 34 - "createAdminClient"
Cohesion: 0.18
Nodes (22): approveBankSlip(), assertAdmin(), rejectBankSlip(), revalidateBankSlipPaths(), TABLE_BANK_SLIPS, createAdminClient(), adminSdkAvailable(), approveBankSlipCore() (+14 more)

### Community 36 - "seller-approvals.ts"
Cohesion: 0.06
Nodes (50): AdminPage(), formatCount(), formatRevenue(), AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps (+42 more)

### Community 37 - "cart-contents.tsx"
Cohesion: 0.21
Nodes (15): CartPage(), AddToCartButton(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), addToCart() (+7 more)

### Community 38 - "reports.ts"
Cohesion: 0.25
Nodes (13): REPORT_ERROR_CODES, ReportActionState, ReportErrorCode, asNullableString(), asReport(), assertReportMutationRateLimit(), createProductReport(), CreateProductReportInput (+5 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.31
Nodes (14): addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine(), isProductInOwnWishlist(), listOwnWishlistItems(), mapWishlistError() (+6 more)

### Community 40 - "orders.ts"
Cohesion: 0.09
Nodes (43): BankSlipUploadForm(), CheckoutForm(), FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, initialState, OrderCancelForm(), OrderCancelFormProps (+35 more)

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

### Community 51 - "button.tsx"
Cohesion: 0.13
Nodes (21): CreateListingForm(), CreateListingFormProps, initialState, initialState, bannerInitial, profileInitial, ShopProfileFormProps, AddToCartButtonProps (+13 more)

### Community 52 - "admin-orders.ts"
Cohesion: 0.18
Nodes (20): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+12 more)

### Community 54 - "appwrite/index.ts"
Cohesion: 0.05
Nodes (80): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount() (+72 more)

### Community 55 - "wishlist/page.tsx"
Cohesion: 0.26
Nodes (9): WishlistPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, listProductImages(), removeFromWishlist() (+1 more)

### Community 56 - "Agent reference docs"
Cohesion: 0.33
Nodes (6): Agent reference docs, By member, Non-negotiables, Payment setup status, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "listing-moderation.ts"
Cohesion: 0.21
Nodes (14): TABLE_PRODUCTS, ACTIVE_STATUS, adminSdkAvailable(), approveListingCore(), ARCHIVED_STATUS, ListingModerationResult, loadProduct(), parseReason() (+6 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "seller-application-actions.ts"
Cohesion: 0.23
Nodes (13): SellerShopPage(), ShopProfileForm(), useActionToasts(), readString(), revalidateShopPaths(), SellerApplicationActionState, ShopProfileActionState, submitSellerApplication() (+5 more)

### Community 65 - "roles.ts"
Cohesion: 0.17
Nodes (13): ADMIN_NAV, AdminLayout(), RegisterPage(), SELLER_NAV, SellerLayout(), PortalShell(), homePathForUser(), LabeledUser (+5 more)

### Community 67 - "payhere-checkout-hash/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 69 - "payhere-notify/package.json"
Cohesion: 0.22
Nodes (8): dependencies, node-appwrite, node-appwrite, main, name, private, type, version

### Community 70 - "reports/page.tsx"
Cohesion: 0.24
Nodes (9): AdminReportsPage(), EMPTY_COPY, formatCreatedAt(), PageProps, STATUS_LABELS, ReportDetails(), ReportRowActions(), parseReportStatusFilter() (+1 more)

### Community 71 - "userHasLabel"
Cohesion: 0.29
Nodes (8): GET(), RouteParams, BecomeSellerPage(), NavLinks(), SellerApplyForm(), ROLE_LABELS, userHasLabel(), bankSlipFileExists()

### Community 72 - "user-management.ts"
Cohesion: 0.39
Nodes (8): AdminUserView, assertCanModifyTarget(), loadTargetUser(), suspendUserCore(), unsuspendUserCore(), UserListResult, UserManagementResult, writeAuditLog()

### Community 73 - "admin/listings/page.tsx"
Cohesion: 0.36
Nodes (8): AdminListingsPage(), formatPrice(), PageProps, ListingDescription(), ListingRowActions(), listPendingModerationQueue(), listProductsByStatus(), getPublicSellerByUserId()

### Community 75 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 77 - "Sandbox demo (step 1.27)"
Cohesion: 0.29
Nodes (7): Decline, cancel, idempotency, Free path (seeded), Happy path (PayHere), Local Next.js vs `notify_url`, Prerequisites, Sandbox demo (step 1.27), Test cards (sandbox only)

### Community 79 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 80 - "users/page.tsx"
Cohesion: 0.43
Nodes (6): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, listUsers(), toAdminUserView()

### Community 81 - "services/index.ts"
Cohesion: 0.23
Nodes (12): WishlistToggleButton(), AdminOrderView, ListAllOrdersResult, CART_ERROR_CODES, CartActionState, CartErrorCode, addToWishlist(), revalidateWishlistPaths() (+4 more)

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

### Community 93 - "products/[id]/page.tsx"
Cohesion: 0.17
Nodes (10): ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, SellerInfoCard(), SellerInfoCardProps, createProductReview(), revalidateReviewPaths(), CreateProductReviewInput (+2 more)

## Knowledge Gaps
- **469 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+464 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation-actions.ts`, `seller-listings.ts`, `free-order.ts`, `dashboard/page.tsx`, `seller-application.ts`, `products.ts`, `reviews.ts`, `report-triage-actions.tsx`, `user-management-actions.tsx`, `types/payhere.ts`, `createAdminClient`, `seller-approvals.ts`, `cart-contents.tsx`, `reports.ts`, `wishlist.ts`, `orders.ts`, `appwrite/index.ts`, `wishlist/page.tsx`, `seller-application-actions.ts`, `roles.ts`, `userHasLabel`, `(store)/layout.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `store-navbar.tsx`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation-actions.ts`, `seller-listings.ts`, `dashboard/page.tsx`, `products.ts`, `bank-slip-review-actions.tsx`, `report-triage-actions.tsx`, `user-management-actions.tsx`, `getLoggedInUser`, `trust-signals.ts`, `cn`, `types/payhere.ts`, `error-fallback.tsx`, `seller-approvals.ts`, `cart-contents.tsx`, `orders.ts`, `admin-orders.ts`, `wishlist/page.tsx`, `users/page.tsx`, `products/[id]/page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `admin-analytics.ts`, `report-triage.ts`, `free-order.ts`, `seller-application.ts`, `products.ts`, `notify-logs.ts`, `report-triage-actions.tsx`, `trust-signals.ts`, `seller-approvals.ts`, `admin-orders.ts`, `appwrite/index.ts`, `listing-moderation.ts`, `userHasLabel`, `user-management.ts`, `admin/listings/page.tsx`, `users/page.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _469 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07288135593220339 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07767722473604827 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09568627450980392 - nodes in this community are weakly interconnected._