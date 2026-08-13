# Graph Report - knurdz-marketplace  (2026-08-13)

## Corpus Check
- 194 files · ~83,697 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1457 nodes · 3983 edges · 76 communities (64 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8c2c8a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- auth.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- listing-moderation.ts
- admin-analytics.ts
- appwrite/index.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seller-approvals.ts
- button.tsx
- types/payhere.ts
- compilerOptions
- OrderStatus
- createAdminClient
- wishlist.ts
- getLoggedInUser
- Work Distribution — Knurdz Marketplace
- bank-slip-review.ts
- components.json
- admin/orders/page.tsx
- bank-slip-actions.ts
- devDependencies
- seed-demo.mjs
- roles.ts
- portal-shell.tsx
- dependencies
- services/index.ts
- trust-signals.ts
- admin-orders.ts
- products.ts
- Tables (17)
- seller-application.ts
- error-fallback.tsx
- seller-approval-actions.tsx
- admin-metrics.ts
- dashboard/page.tsx
- hasAppwritePublicConfig
- products/[id]/page.tsx
- PayHere contract (Knurdz Marketplace)
- Trust rules (Knurdz Marketplace)
- verify-admin-analytics.mjs
- page-loader.tsx
- legal-page.tsx
- user-management-actions.tsx
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- app/layout.tsx
- (store)/layout.tsx
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- Agent reference docs
- devDependencies
- wishlist/page.tsx
- package.json
- shadcn
- AGENTS.md
- 5. Member 1 — Core infrastructure (critical path)
- eslint.config.mjs
- Notify Function
- next.config.ts
- 3. Shared contracts (do not fork)
- postcss.config.mjs
- 7. Member 3 — Seller portal
- Hash Function
- radix-ui
- tailwind-merge
- class-variance-authority
- clsx
- shadcn

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 99 edges
2. `createAdminClient()` - 76 edges
3. `createSessionClient()` - 68 edges
4. `hasAppwritePublicConfig()` - 63 edges
5. `Button()` - 43 edges
6. `cn()` - 31 edges
7. `userHasLabel()` - 28 edges
8. `DATABASE_ID` - 26 edges
9. `getOwnOrder()` - 24 edges
10. `requireLabel()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `CheckoutForm()` --indirect_call--> `createOrder()`  [INFERRED]
  components/store/checkout-form.tsx → lib/services/order-actions.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (76 total, 12 thin omitted)

### Community 0 - "cn"
Cohesion: 0.22
Nodes (15): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+7 more)

### Community 1 - "auth.ts"
Cohesion: 0.05
Nodes (61): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+53 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (45): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+37 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "createSessionClient"
Cohesion: 0.12
Nodes (42): CheckoutPage(), AddToCartButton(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+34 more)

### Community 5 - "types/index.ts"
Cohesion: 0.12
Nodes (31): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, Payment (+23 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (34): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+26 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "appwrite/index.ts"
Cohesion: 0.05
Nodes (77): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount() (+69 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.14
Nodes (14): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 4. How agents should work (all members), 9. Integration map (who waits on whom), Approved MCPs (agents) (+6 more)

### Community 11 - "seller-approvals.ts"
Cohesion: 0.22
Nodes (10): AdminSellerApplication, APPROVED_STATUS, asNullableString(), listPendingSellerApplications(), maskBankAccountNumber(), PENDING_STATUS, REJECTED_STATUS, SellerApprovalResult (+2 more)

### Community 12 - "button.tsx"
Cohesion: 0.17
Nodes (14): initialState, AddToCartButtonProps, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, ProductCatalogFiltersProps, SORT_OPTIONS (+6 more)

### Community 13 - "types/payhere.ts"
Cohesion: 0.11
Nodes (25): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+17 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "OrderStatus"
Cohesion: 0.50
Nodes (4): OrderTimeline(), OrderTimelineProps, deriveOrderTimeline(), OrderStatus

### Community 16 - "createAdminClient"
Cohesion: 0.21
Nodes (16): GET(), RouteParams, BecomeSellerPage(), NavLinks(), userHasLabel(), createAdminClient(), bankSlipFileExists(), AdminUserView (+8 more)

### Community 17 - "wishlist.ts"
Cohesion: 0.20
Nodes (20): TABLE_WISHLIST_ITEMS, addToWishlist(), revalidateWishlistPaths(), addToOwnWishlist(), asNullableString(), assertWishlistMutationRateLimit(), asWishlistItem(), buildWishlistLine() (+12 more)

### Community 18 - "getLoggedInUser"
Cohesion: 0.05
Nodes (77): LoginPage(), safeNextPath(), CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage() (+69 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.07
Nodes (27): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+19 more)

### Community 20 - "bank-slip-review.ts"
Cohesion: 0.17
Nodes (23): fetchPaymentsByOrderIds(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), BankSlipReviewResult, clampLimit(), isAlreadyProcessed(), listPendingBankSlips() (+15 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "admin/orders/page.tsx"
Cohesion: 0.18
Nodes (17): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+9 more)

### Community 23 - "bank-slip-actions.ts"
Cohesion: 0.18
Nodes (18): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "roles.ts"
Cohesion: 0.14
Nodes (22): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, ADMIN_NAV, AdminLayout(), SELLER_NAV (+14 more)

### Community 27 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, lucide-react, next, node-appwrite, dependencies, appwrite, lucide-react, next (+11 more)

### Community 29 - "services/index.ts"
Cohesion: 0.17
Nodes (12): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, UploadValidationError, UploadValidationOk, UploadValidationResult, createProductReview(), revalidateReviewPaths(), REVIEW_ERROR_CODES (+4 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (57): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+49 more)

### Community 31 - "admin-orders.ts"
Cohesion: 0.40
Nodes (9): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), listAllOrders(), ListAllOrdersResult, listOrdersDirect() (+1 more)

### Community 32 - "products.ts"
Cohesion: 0.12
Nodes (29): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductList() (+21 more)

### Community 33 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 34 - "seller-application.ts"
Cohesion: 0.15
Nodes (19): SellerApplyForm(), readString(), SellerApplicationActionState, submitSellerApplication(), existingApplicationMessage(), getOwnSellerProfile(), normalizeShopSlug(), ParsedSellerApplicationInput (+11 more)

### Community 36 - "seller-approval-actions.tsx"
Cohesion: 0.17
Nodes (19): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+11 more)

### Community 37 - "admin-metrics.ts"
Cohesion: 0.27
Nodes (12): AdminPage(), formatCount(), formatRevenue(), AdminMetrics, asNullableString(), asNumber(), countTableRows(), countUsers() (+4 more)

### Community 38 - "dashboard/page.tsx"
Cohesion: 0.28
Nodes (8): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), Order

### Community 39 - "hasAppwritePublicConfig"
Cohesion: 0.21
Nodes (19): ProductPage(), hasAppwritePublicConfig(), asNullableString(), asNumber(), asRating(), asReview(), assertReviewMutationRateLimit(), canReviewProduct() (+11 more)

### Community 40 - "products/[id]/page.tsx"
Cohesion: 0.20
Nodes (12): ProductPageProps, SellerInfoCard(), SellerInfoCardProps, WishlistToggleButton(), WishlistToggleButtonProps, asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId() (+4 more)

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

### Community 46 - "user-management-actions.tsx"
Cohesion: 0.20
Nodes (16): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+8 more)

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

### Community 52 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

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
Cohesion: 0.23
Nodes (10): WishlistPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, listProductImages(), removeFromWishlist() (+2 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "5. Member 1 — Core infrastructure (critical path)"
Cohesion: 0.33
Nodes (6): 5. Member 1 — Core infrastructure (critical path), Blocker rule, Dependencies, Member 1 — Definition of done, Step-by-step plan (small slices), You are building

### Community 65 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 67 - "3. Shared contracts (do not fork)"
Cohesion: 0.40
Nodes (5): 3. Shared contracts (do not fork), Agent rules every step, Minimum collections (Member 1 creates), Ownership of payments, Status enums

### Community 69 - "7. Member 3 — Seller portal"
Cohesion: 0.40
Nodes (5): 7. Member 3 — Seller portal, Dependencies, Member 3 — Definition of done, Step-by-step plan, You are building

### Community 70 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

## Knowledge Gaps
- **374 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+369 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `appwrite/index.ts`, `button.tsx`, `types/payhere.ts`, `createAdminClient`, `wishlist.ts`, `bank-slip-actions.ts`, `roles.ts`, `seller-application.ts`, `seller-approval-actions.tsx`, `dashboard/page.tsx`, `hasAppwritePublicConfig`, `products/[id]/page.tsx`, `user-management-actions.tsx`, `(store)/layout.tsx`, `wishlist/page.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `cn`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `types/payhere.ts`, `getLoggedInUser`, `admin/orders/page.tsx`, `bank-slip-actions.ts`, `roles.ts`, `portal-shell.tsx`, `services/index.ts`, `products.ts`, `error-fallback.tsx`, `seller-approval-actions.tsx`, `dashboard/page.tsx`, `products/[id]/page.tsx`, `user-management-actions.tsx`, `wishlist/page.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `seller-application.ts`, `admin-metrics.ts`, `seller-approval-actions.tsx`, `listing-moderation.ts`, `admin-analytics.ts`, `appwrite/index.ts`, `products/[id]/page.tsx`, `seller-approvals.ts`, `user-management-actions.tsx`, `bank-slip-review.ts`, `roles.ts`, `trust-signals.ts`, `admin-orders.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _374 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05485232067510549 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07767722473604827 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._