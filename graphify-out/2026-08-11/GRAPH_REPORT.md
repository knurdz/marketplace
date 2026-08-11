# Graph Report - .  (2026-08-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1128 nodes · 2965 edges · 57 communities (48 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86da22d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types/index.ts
- seller-approvals.ts
- auth.ts
- services/index.ts
- createAdminClient
- createSessionClient
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- button.tsx
- compilerOptions
- Tables (17)
- appwrite/index.ts
- portal-shell.tsx
- orders.ts
- search/page.tsx
- dashboard/page.tsx
- components.json
- dependencies
- cn
- devDependencies
- storage.ts
- seed-demo.mjs
- profiles.ts
- appwrite/notifications.ts
- Work Distribution — Knurdz Marketplace
- getLoggedInUser
- getOwnOrder
- storage-urls.ts
- order-actions.ts
- error-fallback.tsx
- bank/page.tsx
- PayHere contract (Knurdz Marketplace)
- products.ts
- page-loader.tsx
- legal-page.tsx
- product-catalog-filters.tsx
- Knurdz Marketplace
- setup-storage-buckets.mjs
- scripts
- verify-user-suspend.mjs
- free-order-confirm-form.tsx
- app/layout.tsx
- Notify Function
- Hash Function
- Member 1 — Foundation (must-dos first)
- Agent reference docs
- devDependencies
- package.json
- shadcn
- AGENTS.md
- eslint.config.mjs
- lucide-react
- next
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 84 edges
2. `createSessionClient()` - 54 edges
3. `hasAppwritePublicConfig()` - 46 edges
4. `createAdminClient()` - 40 edges
5. `Button()` - 36 edges
6. `cn()` - 29 edges
7. `getOwnOrder()` - 24 edges
8. `assertRateLimit()` - 21 edges
9. `getOwnPaymentForOrder()` - 21 edges
10. `createPublicClient()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `OrderCancelForm()` --indirect_call--> `cancelOrderAction()`  [INFERRED]
  components/store/order-cancel-form.tsx → lib/services/order-actions.ts

## Import Cycles
- None detected.

## Communities (57 total, 9 thin omitted)

### Community 0 - "types/index.ts"
Cohesion: 0.05
Nodes (76): OrderTimeline(), OrderTimelineProps, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, asBankSlip() (+68 more)

### Community 1 - "seller-approvals.ts"
Cohesion: 0.05
Nodes (66): ADMIN_NAV, AdminLayout(), AdminSellersPage(), formatAppliedAt(), AdminUsersPage(), formatJoinedAt(), formatLabels(), PageProps (+58 more)

### Community 2 - "auth.ts"
Cohesion: 0.06
Nodes (58): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+50 more)

### Community 3 - "services/index.ts"
Cohesion: 0.07
Nodes (66): CategoriesPage(), ProductPage(), ProductReviewsPlaceholder(), hasAppwritePublicConfig(), TABLE_CATEGORIES, TABLE_PLATFORM_SETTINGS, asCategory(), asNullableString() (+58 more)

### Community 4 - "createAdminClient"
Cohesion: 0.06
Nodes (58): AdminListingsPage(), formatPrice(), PageProps, AdminPage(), formatCount(), formatRevenue(), initial, ListingApproveButton() (+50 more)

### Community 5 - "createSessionClient"
Cohesion: 0.10
Nodes (43): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar(), AddToCartButton(), CartContents(), CartContentsProps (+35 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.07
Nodes (34): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+26 more)

### Community 8 - "button.tsx"
Cohesion: 0.11
Nodes (18): ProductPageProps, initialState, OrderCancelFormProps, PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), ProductReviewsPlaceholderProps, issueLabel() (+10 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 10 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 11 - "appwrite/index.ts"
Cohesion: 0.15
Nodes (20): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, BUCKET_PRODUCT_IMAGES, PRODUCT_IMAGE_MAX_BYTES (+12 more)

### Community 12 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 13 - "orders.ts"
Cohesion: 0.16
Nodes (21): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+13 more)

### Community 14 - "search/page.tsx"
Cohesion: 0.15
Nodes (17): CategoryPage(), CategoryPageProps, HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductList(), ProductListProps (+9 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.14
Nodes (18): COMPLETED_STATUSES, countOrdersBySummaryBucket(), DashboardPage(), IN_PROGRESS_STATUSES, OrderSummaryCounts, PENDING_STATUSES, wishlistIssueLabel(), OrderDetailPage() (+10 more)

### Community 16 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 17 - "dependencies"
Cohesion: 0.10
Nodes (21): appwrite, class-variance-authority, clsx, node-appwrite, dependencies, appwrite, class-variance-authority, clsx (+13 more)

### Community 18 - "cn"
Cohesion: 0.22
Nodes (15): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+7 more)

### Community 19 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 20 - "storage.ts"
Cohesion: 0.20
Nodes (18): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+10 more)

### Community 21 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 22 - "profiles.ts"
Cohesion: 0.23
Nodes (15): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+7 more)

### Community 23 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 24 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.15
Nodes (17): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal, Member 3 — verification extras, Member 4 — Admin, moderation, trust (+9 more)

### Community 25 - "getLoggedInUser"
Cohesion: 0.27
Nodes (9): LoginPage(), safeNextPath(), CartPage(), CheckoutPage(), CheckoutContinuationPageProps, CheckoutPayHerePage(), getLoggedInUser(), getCart() (+1 more)

### Community 26 - "getOwnOrder"
Cohesion: 0.30
Nodes (11): CheckoutBankPage(), CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, PayHereReturnPage(), PayHereReturnPageProps, PayHerePaymentStatus(), PayHerePaymentStatusProps (+3 more)

### Community 27 - "storage-urls.ts"
Cohesion: 0.26
Nodes (11): WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), getAppwriteEndpoint(), getAppwriteProjectId(), getAvatarViewUrl() (+3 more)

### Community 28 - "order-actions.ts"
Cohesion: 0.22
Nodes (12): CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, cancelOrderAction(), createOrder(), revalidateCheckoutPaths(), revalidateOrderPaths() (+4 more)

### Community 30 - "bank/page.tsx"
Cohesion: 0.19
Nodes (10): CheckoutContinuationPageProps, BankSlipUploadForm(), BankSlipUploadFormProps, initialState, ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, submitBankSlipAction() (+2 more)

### Community 31 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 32 - "products.ts"
Cohesion: 0.29
Nodes (11): DATABASE_ID, asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage(), isPubliclyListed(), listProductImages() (+3 more)

### Community 34 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 35 - "product-catalog-filters.tsx"
Cohesion: 0.27
Nodes (6): AddToCartButtonProps, ProductCatalogFiltersProps, SORT_OPTIONS, Input(), Label(), ProductCatalogParams

### Community 36 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 37 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 38 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 39 - "verify-user-suspend.mjs"
Cohesion: 0.47
Nodes (8): adminClient(), assert(), countAuditEvents(), findUserByEmail(), main(), requireEnv(), sessionGet(), tryLogin()

### Community 40 - "free-order-confirm-form.tsx"
Cohesion: 0.32
Nodes (6): CheckoutContinuationPageProps, FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, confirmFreeOrderAction(), ConfirmFreeOrderActionState

### Community 41 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 43 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 44 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 45 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 46 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 47 - "devDependencies"
Cohesion: 0.40
Nodes (4): devDependencies, shadcn, shadcn, shadcn

### Community 48 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **297 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `SearchPageProps` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `types/index.ts`, `seller-approvals.ts`, `auth.ts`, `services/index.ts`, `createAdminClient`, `createSessionClient`, `free-order-confirm-form.tsx`, `button.tsx`, `appwrite/index.ts`, `orders.ts`, `dashboard/page.tsx`, `storage.ts`, `profiles.ts`, `appwrite/notifications.ts`, `getOwnOrder`, `storage-urls.ts`, `bank/page.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `seller-approvals.ts`, `services/index.ts`, `createAdminClient`, `product-catalog-filters.tsx`, `createSessionClient`, `free-order-confirm-form.tsx`, `portal-shell.tsx`, `search/page.tsx`, `dashboard/page.tsx`, `cn`, `getLoggedInUser`, `getOwnOrder`, `order-actions.ts`, `error-fallback.tsx`, `bank/page.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `createAdminClient` to `seller-approvals.ts`, `auth.ts`, `appwrite/index.ts`, `storage.ts`, `profiles.ts`, `appwrite/notifications.ts`, `storage-urls.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _297 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05048766494549627 - nodes in this community are weakly interconnected._
- **Should `seller-approvals.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05297334244702666 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05741626794258373 - nodes in this community are weakly interconnected._