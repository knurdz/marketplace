# Graph Report - knurdz-marketplace  (2026-08-14)

## Corpus Check
- 196 files · ~83,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1464 nodes · 4010 edges · 75 communities (63 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21e14178`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- button.tsx
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
- order-actions.ts
- types/payhere.ts
- compilerOptions
- orders/[id]/page.tsx
- seller-application.ts
- dashboard/page.tsx
- orders.ts
- Work Distribution — Knurdz Marketplace
- profiles.ts
- components.json
- admin/orders/page.tsx
- createAdminClient
- devDependencies
- seed-demo.mjs
- requireLabel
- appwrite/notifications.ts
- dependencies
- storage.ts
- trust-signals.ts
- userHasLabel
- roles.ts
- Tables (17)
- user-management-actions.tsx
- error-fallback.tsx
- seller-approval-actions.tsx
- admin-metrics.ts
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- services/index.ts
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
- bank-slip-actions.ts
- eslint.config.mjs
- Member 1 — Foundation (must-dos first)
- next.config.ts
- toast.ts
- postcss.config.mjs
- DATABASE_ID
- bank-slips/page.tsx
- Member 4 — Admin, moderation, trust
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
7. `userHasLabel()` - 30 edges
8. `DATABASE_ID` - 26 edges
9. `getOwnOrder()` - 24 edges
10. `requireLabel()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `AdminLayout()` --calls--> `requireLabel()`  [EXTRACTED]
  app/admin/layout.tsx → lib/appwrite/roles.ts
- `UserSuspendForm()` --indirect_call--> `suspendUser()`  [INFERRED]
  components/admin/user-management-actions.tsx → lib/appwrite/user-management-actions.ts
- `UserUnsuspendButton()` --indirect_call--> `unsuspendUser()`  [INFERRED]
  components/admin/user-management-actions.tsx → lib/appwrite/user-management-actions.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (75 total, 12 thin omitted)

### Community 0 - "button.tsx"
Cohesion: 0.06
Nodes (54): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, CategoryPageProps, StoreLayout(), HomeProps, SearchPageProps (+46 more)

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (59): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+51 more)

### Community 2 - "platform-settings-admin.ts"
Cohesion: 0.08
Nodes (44): AdminSettingsPage(), BOOLEAN_KEYS, initial, KEY_HELP, KEY_LABELS, PlatformSettingsManager(), PlatformSettingsManagerProps, SettingFieldForm() (+36 more)

### Community 3 - "categories.ts"
Cohesion: 0.09
Nodes (46): AdminCategoriesPage(), CategoriesPage(), CategoriesManager(), CategoriesManagerProps, CategoryRow(), CategoryRowProps, CreateCategoryForm(), initial (+38 more)

### Community 4 - "createSessionClient"
Cohesion: 0.13
Nodes (39): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+31 more)

### Community 5 - "types/index.ts"
Cohesion: 0.12
Nodes (31): AuditLogEntry, BankSlip, Cart, CartItem, CartLine, CartLineIssue, CartView, OrderItem (+23 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "listing-moderation.ts"
Cohesion: 0.11
Nodes (35): AdminListingsPage(), formatPrice(), PageProps, initial, ListingApproveButton(), ListingDescription(), ListingRejectForm(), ListingRemoveForm() (+27 more)

### Community 8 - "admin-analytics.ts"
Cohesion: 0.11
Nodes (32): AdminAnalyticsPage(), PageProps, rangeHref(), AnalyticsCharts(), AnalyticsChartsProps, formatBucketLabel(), formatCurrency(), GrowthTooltipProps (+24 more)

### Community 9 - "appwrite/index.ts"
Cohesion: 0.13
Nodes (25): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, PRODUCT_IMAGE_MAX_BYTES, SESSION_COOKIE (+17 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "seller-approvals.ts"
Cohesion: 0.21
Nodes (13): AdminSellerApplication, APPROVED_STATUS, approveSellerApplicationCore(), asNullableString(), loadSellerProfileRow(), maskBankAccountNumber(), mergeSellerLabel(), PENDING_STATUS (+5 more)

### Community 12 - "order-actions.ts"
Cohesion: 0.11
Nodes (25): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmForm() (+17 more)

### Community 13 - "types/payhere.ts"
Cohesion: 0.11
Nodes (24): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), ConfirmFreeOrderRequest, ConfirmFreeOrderResult (+16 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 15 - "orders/[id]/page.tsx"
Cohesion: 0.19
Nodes (15): OrderDetailPage(), OrderDetailPageProps, OrdersPage(), OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus() (+7 more)

### Community 16 - "seller-application.ts"
Cohesion: 0.12
Nodes (22): BecomeSellerPage(), SellerApplicationStatus(), SellerApplicationStatusProps, SellerApplyForm(), readString(), SellerApplicationActionState, submitSellerApplication(), existingApplicationMessage() (+14 more)

### Community 17 - "dashboard/page.tsx"
Cohesion: 0.17
Nodes (13): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), PayHereCheckoutForm() (+5 more)

### Community 18 - "orders.ts"
Cohesion: 0.16
Nodes (20): CancelOrderResult, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, PollPayHerePaymentStatusActionState, SubmitBankSlipInput, SubmitBankSlipResult (+12 more)

### Community 19 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.12
Nodes (16): Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Principles, Risks (track while implementing) (+8 more)

### Community 20 - "profiles.ts"
Cohesion: 0.22
Nodes (16): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+8 more)

### Community 21 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 22 - "admin/orders/page.tsx"
Cohesion: 0.27
Nodes (10): AdminOrdersPage(), buildFilterHref(), formatAmount(), formatCreatedAt(), formatPaymentStatus(), PageProps, PAYMENT_STATUS_LABELS, truncateAddress() (+2 more)

### Community 23 - "createAdminClient"
Cohesion: 0.23
Nodes (18): GET(), RouteParams, createAdminClient(), adminSdkAvailable(), approveBankSlipCore(), asNullableString(), bankSlipFileExists(), BankSlipReviewResult (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 25 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 26 - "requireLabel"
Cohesion: 0.23
Nodes (15): AdminAuditPage(), buildFilterHref(), formatCreatedAt(), formatMetaDisplay(), PageProps, requireLabel(), adminSdkAvailable(), asAuditLogEntry() (+7 more)

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

### Community 31 - "userHasLabel"
Cohesion: 0.25
Nodes (15): NavLinks(), userHasLabel(), assertAdmin(), revalidateUserPaths(), suspendUser(), unsuspendUser(), AdminUserView, assertCanModifyTarget() (+7 more)

### Community 32 - "roles.ts"
Cohesion: 0.24
Nodes (9): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), requireUser(), ROLE_LABELS, RoleLabel (+1 more)

### Community 33 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 34 - "user-management-actions.tsx"
Cohesion: 0.22
Nodes (12): AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps, suspendInitial, unsuspendInitial, useManagementToast(), UserSuspendForm() (+4 more)

### Community 36 - "seller-approval-actions.tsx"
Cohesion: 0.21
Nodes (15): AdminSellersPage(), formatAppliedAt(), approveInitial, rejectInitial, SellerApprovalRowProps, SellerApproveButton(), SellerApproveButtonProps, SellerRejectForm() (+7 more)

### Community 37 - "admin-metrics.ts"
Cohesion: 0.27
Nodes (12): AdminPage(), formatCount(), formatRevenue(), AdminMetrics, asNullableString(), asNumber(), countTableRows(), countUsers() (+4 more)

### Community 38 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 39 - "services/index.ts"
Cohesion: 0.05
Nodes (88): CategoryPage(), Home(), ProductPage(), ProductPageProps, SearchPage(), ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, SellerInfoCard() (+80 more)

### Community 40 - "admin-orders.ts"
Cohesion: 0.19
Nodes (22): AdminOrderView, adminSdkAvailable(), asAdminOrder(), asNullableString(), clampLimit(), fetchPaymentsByOrderIds(), listAllOrders(), ListAllOrdersResult (+14 more)

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
Cohesion: 0.15
Nodes (22): LoginPage(), safeNextPath(), CartPage(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), CheckoutPage() (+14 more)

### Community 56 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 57 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 58 - "server.ts"
Cohesion: 0.25
Nodes (11): WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), BUCKET_PRODUCT_IMAGES, getAppwriteEndpoint(), getAppwriteProjectId() (+3 more)

### Community 59 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 63 - "bank-slip-actions.ts"
Cohesion: 0.27
Nodes (13): BankSlipApproveButton(), BankSlipRejectForm(), initial, useBankSlipToast(), approveBankSlip(), approveBankSlipFormAction(), assertAdmin(), BankSlipActionState (+5 more)

### Community 65 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 67 - "toast.ts"
Cohesion: 0.31
Nodes (6): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, removeFromWishlist()

### Community 69 - "DATABASE_ID"
Cohesion: 0.25
Nodes (7): DATABASE_ID, assert(), mapped, systemMapped, systemRow, validRow, verifyAppwriteLockdown()

### Community 70 - "bank-slips/page.tsx"
Cohesion: 0.36
Nodes (7): AdminBankSlipsPage(), formatAmount(), formatUploadedAt(), PageProps, BankSlipImage(), BankSlipReviewActions(), getBankSlipReviewUrl()

### Community 72 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

## Knowledge Gaps
- **375 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+370 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `button.tsx`, `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `createSessionClient`, `listing-moderation.ts`, `appwrite/index.ts`, `types/payhere.ts`, `orders/[id]/page.tsx`, `seller-application.ts`, `dashboard/page.tsx`, `orders.ts`, `profiles.ts`, `createAdminClient`, `appwrite/notifications.ts`, `storage.ts`, `userHasLabel`, `roles.ts`, `seller-approval-actions.tsx`, `services/index.ts`, `server.ts`, `bank-slip-actions.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `auth.ts`, `platform-settings-admin.ts`, `categories.ts`, `listing-moderation.ts`, `admin-analytics.ts`, `appwrite/index.ts`, `seller-approvals.ts`, `seller-application.ts`, `profiles.ts`, `requireLabel`, `appwrite/notifications.ts`, `storage.ts`, `trust-signals.ts`, `userHasLabel`, `user-management-actions.tsx`, `seller-approval-actions.tsx`, `admin-metrics.ts`, `services/index.ts`, `admin-orders.ts`, `server.ts`, `bank-slip-actions.ts`, `DATABASE_ID`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `user-management-actions.tsx`, `categories.ts`, `server.ts`, `platform-settings-admin.ts`, `bank-slips/page.tsx`, `services/index.ts`, `listing-moderation.ts`, `seller-approval-actions.tsx`, `createSessionClient`, `toast.ts`, `order-actions.ts`, `orders/[id]/page.tsx`, `dashboard/page.tsx`, `error-fallback.tsx`, `getLoggedInUser`, `admin/orders/page.tsx`, `requireLabel`, `bank-slip-actions.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _375 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05847781369379959 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056049213943950786 - nodes in this community are weakly interconnected._
- **Should `platform-settings-admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0792156862745098 - nodes in this community are weakly interconnected._