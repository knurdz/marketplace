# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 153 files · ~59,113 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1057 nodes · 2750 edges · 55 communities (43 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50e157f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- setup-mvp-schema.mjs
- auth.ts
- devDependencies
- compilerOptions
- dependencies
- button.tsx
- reviews.ts
- Tables (17)
- components.json
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seed-demo.mjs
- Work Distribution — Knurdz Marketplace
- wishlist.ts
- Knurdz Marketplace
- PayHere contract (Knurdz Marketplace)
- error-fallback.tsx
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- devDependencies
- AGENTS.md
- cart.ts
- order-actions.ts
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- orders/page.tsx
- types/index.ts
- Notify Function
- Hash Function
- seller-approvals.ts
- shadcn
- Agent reference docs
- products.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- getLoggedInUser
- services/index.ts
- scripts
- orders.ts
- profiles.ts
- server.ts
- appwrite/notifications.ts
- package.json
- categories.ts
- react-dom
- sonner
- tailwind-merge
- platform-settings.ts
- bank/page.tsx
- getCart
- login/page.tsx
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 78 edges
2. `createSessionClient()` - 54 edges
3. `hasAppwritePublicConfig()` - 42 edges
4. `Button()` - 32 edges
5. `cn()` - 29 edges
6. `createAdminClient()` - 27 edges
7. `getOwnOrder()` - 24 edges
8. `assertRateLimit()` - 21 edges
9. `getOwnPaymentForOrder()` - 21 edges
10. `getProduct()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `BankSlipUploadForm()` --indirect_call--> `submitBankSlipAction()`  [INFERRED]
  components/store/bank-slip-upload-form.tsx → lib/services/order-actions.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts
- `LoginPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/login/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts

## Import Cycles
- None detected.

## Communities (55 total, 12 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.16
Nodes (19): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, BUCKET_PRODUCT_IMAGES, DATABASE_ID (+11 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 2 - "auth.ts"
Cohesion: 0.06
Nodes (59): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+51 more)

### Community 3 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, clsx, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 6 - "button.tsx"
Cohesion: 0.07
Nodes (48): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, StoreLayout(), PortalNavItem, PortalShellProps, SideNav() (+40 more)

### Community 7 - "reviews.ts"
Cohesion: 0.09
Nodes (32): ProductPage(), ProductPageProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, SellerInfoCard(), SellerInfoCardProps, TABLE_REVIEWS, createProductReview() (+24 more)

### Community 8 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 11 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.07
Nodes (27): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+19 more)

### Community 13 - "wishlist.ts"
Cohesion: 0.12
Nodes (30): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, WishlistToggleButton(), WishlistToggleButtonProps, hasAppwritePublicConfig() (+22 more)

### Community 14 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 15 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.17
Nodes (12): Checkout URLs, Environment, Free confirm (not a PayHere Function), Free path, Function IDs, Ownership, PayHere card (sandbox), PayHere contract (Knurdz Marketplace) (+4 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 22 - "cart.ts"
Cohesion: 0.13
Nodes (39): AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel(), createSessionClient() (+31 more)

### Community 23 - "order-actions.ts"
Cohesion: 0.10
Nodes (28): BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmForm(), FreeOrderConfirmFormProps (+20 more)

### Community 24 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 25 - "orders/page.tsx"
Cohesion: 0.31
Nodes (8): OrdersPage(), asBankSlip(), asNullableString(), asNumber(), asOrder(), asOrderItem(), asPayment(), listOwnOrders()

### Community 26 - "types/index.ts"
Cohesion: 0.05
Nodes (74): OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), formatOrderStatus() (+66 more)

### Community 28 - "Notify Function"
Cohesion: 0.33
Nodes (6): Fields (see `PAYHERE_NOTIFY_FIELDS`), Idempotency, md5sig verification (mandatory before any DB write), Notify Function, Status mapping, Trust boundary

### Community 29 - "Hash Function"
Cohesion: 0.33
Nodes (6): Hash formula (server-only), Hash Function, Next.js client, Request, Response, Security rules (Member 4 must enforce)

### Community 30 - "seller-approvals.ts"
Cohesion: 0.05
Nodes (64): ADMIN_NAV, AdminLayout(), AdminPage(), formatCount(), formatRevenue(), AdminSellersPage(), formatAppliedAt(), SELLER_NAV (+56 more)

### Community 32 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 33 - "products.ts"
Cohesion: 0.12
Nodes (30): CategoryPage(), CategoryPageProps, Home(), HomeProps, SearchPage(), SearchPageProps, ProductCatalogFilters(), ProductList() (+22 more)

### Community 38 - "getLoggedInUser"
Cohesion: 0.20
Nodes (20): CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage(), PayHereReturnPage() (+12 more)

### Community 39 - "services/index.ts"
Cohesion: 0.21
Nodes (17): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), extensionOf(), publicImagePermissions(), toInputFile() (+9 more)

### Community 40 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 41 - "orders.ts"
Cohesion: 0.17
Nodes (19): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+11 more)

### Community 42 - "profiles.ts"
Cohesion: 0.22
Nodes (16): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+8 more)

### Community 43 - "server.ts"
Cohesion: 0.22
Nodes (13): WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), getAppwriteEndpoint(), getAppwriteProjectId(), getAvatarViewUrl() (+5 more)

### Community 44 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 45 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 46 - "categories.ts"
Cohesion: 0.36
Nodes (7): CategoriesPage(), asCategory(), asNullableString(), asNumber(), getCategoryBySlug(), listCategories(), Category

### Community 50 - "platform-settings.ts"
Cohesion: 0.44
Nodes (8): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables(), PlatformSetting

### Community 51 - "bank/page.tsx"
Cohesion: 0.33
Nodes (5): CheckoutContinuationPageProps, BankSlipUploadForm(), ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

### Community 52 - "getCart"
Cohesion: 0.60
Nodes (3): CartPage(), CheckoutPage(), getCart()

## Knowledge Gaps
- **300 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+295 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `auth.ts`, `button.tsx`, `reviews.ts`, `services/index.ts`, `orders.ts`, `profiles.ts`, `server.ts`, `appwrite/notifications.ts`, `wishlist.ts`, `bank/page.tsx`, `getCart`, `login/page.tsx`, `cart.ts`, `order-actions.ts`, `orders/page.tsx`, `types/index.ts`, `seller-approvals.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `products.ts`, `getLoggedInUser`, `reviews.ts`, `server.ts`, `wishlist.ts`, `categories.ts`, `error-fallback.tsx`, `getCart`, `cart.ts`, `order-actions.ts`, `orders/page.tsx`, `types/index.ts`, `seller-approvals.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05639097744360902 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._