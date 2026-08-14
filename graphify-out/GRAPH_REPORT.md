# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 200 files · ~85,109 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1491 nodes · 4106 edges · 77 communities (65 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a5e54a0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- portal-shell.tsx
- recovery.ts
- platform-settings-admin.ts
- categories.ts
- createSessionClient
- types/index.ts
- setup-mvp-schema.mjs
- createAdminClient
- admin-analytics.ts
- appwrite/index.ts
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seller-approvals.ts
- button.tsx
- types/payhere.ts
- compilerOptions
- orders/[id]/page.tsx
- services/index.ts
- products.ts
- orders.ts
- Work Distribution — Knurdz Marketplace
- profiles.ts
- components.json
- reviews.ts
- bank-slip-review.ts
- devDependencies
- seed-demo.mjs
- audit-logs.ts
- appwrite/notifications.ts
- dependencies
- storage.ts
- trust-signals.ts
- cn
- userHasLabel
- Tables (17)
- auth.ts
- error-fallback.tsx
- seller-approval-actions.tsx
- rate-limit.ts
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- hasAppwritePublicConfig
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
- radix-ui
- tailwind-merge
- Agent reference docs
- devDependencies
- server.ts
- package.json
- shadcn
- AGENTS.md
- seller-application-actions.ts
- eslint.config.mjs
- Member 1 — Foundation (must-dos first)
- next.config.ts
- sellers.ts
- postcss.config.mjs
- DATABASE_ID
- reports.ts
- (store)/layout.tsx
- Member 4 — Admin, moderation, trust
- class-variance-authority
- clsx
- app/layout.tsx
- shadcn

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 101 edges
2. `createAdminClient()` - 77 edges
3. `createSessionClient()` - 70 edges
4. `hasAppwritePublicConfig()` - 65 edges
5. `Button()` - 44 edges
6. `cn()` - 31 edges
7. `userHasLabel()` - 30 edges
8. `DATABASE_ID` - 26 edges
9. `getOwnOrder()` - 24 edges
10. `requireLabel()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `SellerApplyForm()` --indirect_call--> `submitSellerApplication()`  [INFERRED]
  components/seller/seller-apply-form.tsx → lib/appwrite/seller-application-actions.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (77 total, 12 thin omitted)

### Community 0 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 1 - "recovery.ts"
Cohesion: 0.14
Nodes (19): SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, ResendVerificationForm(), initialState (+11 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (44): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+36 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "createSessionClient"
Cohesion: 0.11
Nodes (46): CartPage(), AddToCartButton(), CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+38 more)

### Community 5 - "types/index.ts"
Cohesion: 0.12
Nodes (34): AuditLogEntry, Cart, CartItem, CartLine, CartLineIssue, Product, ProductImage, WishlistItem (+26 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "createAdminClient"
Cohesion: 0.05
Nodes (72): AdminListingsPage(), formatPrice(), PageProps, AdminPage(), formatCount(), formatRevenue(), AdminUsersPage(), formatJoinedAt() (+64 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "appwrite/index.ts"
Cohesion: 0.12
Nodes (27): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, PRODUCT_IMAGE_MAX_BYTES, SESSION_COOKIE (+19 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "seller-approvals.ts"
Cohesion: 0.21
Nodes (14): AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), asSellerProfile(), loadSellerProfileRow(), maskBankAccountNumber(), mergeSellerLabel() (+6 more)

### Community 12 - "button.tsx"
Cohesion: 0.18
Nodes (14): initialState, bannerInitial, profileInitial, ShopProfileFormProps, AddToCartButtonProps, BankSlipUploadFormProps, initialState, CheckoutFormProps (+6 more)

### Community 13 - "types/payhere.ts"
Cohesion: 0.08
Nodes (30): FreeOrderConfirmFormProps, initialState, PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED (+22 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "orders/[id]/page.tsx"
Cohesion: 0.22
Nodes (14): OrderDetailPage(), OrderDetailPageProps, OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod() (+6 more)

### Community 16 - "services/index.ts"
Cohesion: 0.16
Nodes (18): existingApplicationMessage(), normalizeShopSlug(), ParsedSellerApplicationInput, parseSellerApplicationInput(), PENDING_STATUS, resolveUniqueShopSlug(), SellerApplicationResult, sellerProfilePermissions() (+10 more)

### Community 17 - "products.ts"
Cohesion: 0.11
Nodes (32): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ShopPage(), ShopPageProps (+24 more)

### Community 18 - "orders.ts"
Cohesion: 0.10
Nodes (32): BankSlipUploadForm(), CheckoutForm(), initialState, OrderCancelForm(), OrderCancelFormProps, cancelOrderAction(), createOrder(), revalidateCheckoutPaths() (+24 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "profiles.ts"
Cohesion: 0.22
Nodes (16): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+8 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "reviews.ts"
Cohesion: 0.13
Nodes (23): ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, createProductReview(), revalidateReviewPaths(), REVIEW_ERROR_CODES, ReviewActionState, ReviewErrorCode, asNullableString() (+15 more)

### Community 23 - "bank-slip-review.ts"
Cohesion: 0.10
Nodes (37): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipApproveButton(), BankSlipImage(), BankSlipRejectForm(), BankSlipReviewActions() (+29 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "audit-logs.ts"
Cohesion: 0.23
Nodes (14): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, adminSdkAvailable(), asAuditLogEntry(), asNullableString() (+6 more)

### Community 27 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, lucide-react, next, node-appwrite, dependencies, appwrite, lucide-react, next (+11 more)

### Community 29 - "storage.ts"
Cohesion: 0.19
Nodes (17): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+9 more)

### Community 30 - "trust-signals.ts"
Cohesion: 0.07
Nodes (58): AdminTrustPage(), RULE_LABELS, ruleLabel(), adminSdkAvailable(), asNullableString(), buildEvaluationBundle(), chunk(), countOpenReportsBySeller() (+50 more)

### Community 31 - "cn"
Cohesion: 0.18
Nodes (17): formatRelative(), NotificationBell(), SellerApplicationStatus(), SellerApplicationStatusProps, Badge(), badgeVariants, Popover(), PopoverContent() (+9 more)

### Community 32 - "userHasLabel"
Cohesion: 0.17
Nodes (17): ADMIN_NAV, AdminLayout(), GET(), RouteParams, SELLER_NAV, SellerLayout(), BecomeSellerPage(), PortalShell() (+9 more)

### Community 33 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 34 - "auth.ts"
Cohesion: 0.23
Nodes (13): RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState, mapAuthError(), readString() (+5 more)

### Community 36 - "seller-approval-actions.tsx"
Cohesion: 0.21
Nodes (15): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+7 more)

### Community 37 - "rate-limit.ts"
Cohesion: 0.17
Nodes (15): assertRateLimit(), assertRateLimits(), BucketHits, getClientIp(), peekRateLimit(), pruneIfNeeded(), RATE_LIMIT_MESSAGE, RATE_LIMITS (+7 more)

### Community 38 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 39 - "hasAppwritePublicConfig"
Cohesion: 0.08
Nodes (44): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), ProductPage() (+36 more)

### Community 40 - "admin-orders.ts"
Cohesion: 0.15
Nodes (27): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+19 more)

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
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 52 - "getLoggedInUser"
Cohesion: 0.14
Nodes (24): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage(), PayHereCancelPage() (+16 more)

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "server.ts"
Cohesion: 0.24
Nodes (12): WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), BUCKET_PRODUCT_IMAGES, getAppwriteEndpoint(), getAppwriteProjectId() (+4 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "seller-application-actions.ts"
Cohesion: 0.23
Nodes (13): SellerShopPage(), ShopProfileForm(), useActionToasts(), readString(), revalidateShopPaths(), SellerApplicationActionState, ShopProfileActionState, submitSellerApplication() (+5 more)

### Community 65 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 67 - "sellers.ts"
Cohesion: 0.21
Nodes (11): SellerInfoCard(), SellerInfoCardProps, asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId(), getSellerBankDetailsForCheckout(), isApprovedPublicSellerStatus(), PublicSellerInfo (+3 more)

### Community 69 - "DATABASE_ID"
Cohesion: 0.25
Nodes (7): DATABASE_ID, assert(), mapped, systemMapped, systemRow, validRow, verifyAppwriteLockdown()

### Community 70 - "reports.ts"
Cohesion: 0.26
Nodes (12): REPORT_ERROR_CODES, ReportActionState, ReportErrorCode, asNullableString(), asReport(), createProductReport(), CreateProductReportInput, mapReportError() (+4 more)

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
- **380 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `recovery.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `createAdminClient`, `appwrite/index.ts`, `types/payhere.ts`, `orders/[id]/page.tsx`, `services/index.ts`, `orders.ts`, `profiles.ts`, `reviews.ts`, `bank-slip-review.ts`, `appwrite/notifications.ts`, `storage.ts`, `userHasLabel`, `auth.ts`, `seller-approval-actions.tsx`, `hasAppwritePublicConfig`, `server.ts`, `seller-application-actions.ts`, `reports.ts`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `hasAppwritePublicConfig()` connect `hasAppwritePublicConfig` to `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `createAdminClient`, `admin-analytics.ts`, `appwrite/index.ts`, `seller-approvals.ts`, `types/payhere.ts`, `services/index.ts`, `products.ts`, `orders.ts`, `reviews.ts`, `bank-slip-review.ts`, `audit-logs.ts`, `trust-signals.ts`, `seller-approval-actions.tsx`, `admin-orders.ts`, `getLoggedInUser`, `seller-application-actions.ts`, `DATABASE_ID`, `reports.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `portal-shell.tsx`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `createAdminClient`, `types/payhere.ts`, `orders/[id]/page.tsx`, `products.ts`, `orders.ts`, `reviews.ts`, `bank-slip-review.ts`, `audit-logs.ts`, `cn`, `error-fallback.tsx`, `seller-approval-actions.tsx`, `hasAppwritePublicConfig`, `admin-orders.ts`, `getLoggedInUser`, `server.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `recovery.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13756613756613756 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0792156862745098 - nodes in this community are weakly interconnected._
- **Should `categories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._