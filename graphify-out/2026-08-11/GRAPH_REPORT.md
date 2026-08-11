# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 134 files · ~51,485 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 919 nodes · 2253 edges · 46 communities (35 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `662ec74d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- cn
- recovery.ts
- types/index.ts
- products.ts
- PayHere contract (Knurdz Marketplace)
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- devDependencies
- dependencies
- compilerOptions
- Tables (16)
- Work Distribution — Knurdz Marketplace
- components.json
- seed-demo.mjs
- error-fallback.tsx
- cart.ts
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- scripts
- getLoggedInUser
- shadcn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- package.json
- devDependencies
- orders.ts
- react-dom
- sonner
- tailwind-merge
- sellers.ts
- roles.ts
- order-actions.ts
- storage.ts
- auth.ts
- orders/[id]/page.tsx
- profiles.ts
- services/index.ts
- platform-settings.ts
- bank/page.tsx
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 65 edges
2. `createSessionClient()` - 45 edges
3. `cn()` - 29 edges
4. `Button()` - 26 edges
5. `hasAppwritePublicConfig()` - 26 edges
6. `getOwnOrder()` - 24 edges
7. `getOwnPaymentForOrder()` - 21 edges
8. `createAdminClient()` - 17 edges
9. `Tables (16)` - 17 edges
10. `createPublicClient()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `CheckoutForm()` --indirect_call--> `createOrder()`  [INFERRED]
  components/store/checkout-form.tsx → lib/services/order-actions.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `CartPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(store)/cart/page.tsx → lib/appwrite/session.ts

## Import Cycles
- None detected.

## Communities (46 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.13
Nodes (28): ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES (+20 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (59): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, CategoryPage(), CategoryPageProps, StoreLayout(), Home() (+51 more)

### Community 2 - "recovery.ts"
Cohesion: 0.08
Nodes (39): SearchParams, SearchParams, VerifyEmailPage(), CategoriesPage(), ForgotPasswordForm(), initialState, initialState, ResendVerificationForm() (+31 more)

### Community 3 - "types/index.ts"
Cohesion: 0.06
Nodes (66): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, mapExecutionError(), normalizePayHereOrderId() (+58 more)

### Community 4 - "products.ts"
Cohesion: 0.10
Nodes (27): ProductPage(), ProductPageProps, SearchPage(), ProductReviewsPlaceholder(), SellerInfoCard(), SellerInfoCardProps, TABLE_PRODUCT_IMAGES, TABLE_PRODUCTS (+19 more)

### Community 5 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (37): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+29 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, clsx, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "Tables (16)"
Cohesion: 0.08
Nodes (25): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+17 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.05
Nodes (42): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session), Agent / quality rules, Appwrite setup, Auth routes (+34 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 16 - "cart.ts"
Cohesion: 0.11
Nodes (43): CartPage(), CheckoutPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps (+35 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 21 - "getLoggedInUser"
Cohesion: 0.15
Nodes (25): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps (+17 more)

### Community 29 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 30 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 31 - "orders.ts"
Cohesion: 0.11
Nodes (30): TABLE_BANK_SLIPS, TABLE_ORDER_ITEMS, TABLE_ORDERS, TABLE_PAYMENTS, CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult (+22 more)

### Community 35 - "sellers.ts"
Cohesion: 0.48
Nodes (6): DATABASE_ID, asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId(), getSellerBankDetailsForCheckout(), isSellerStatus()

### Community 36 - "roles.ts"
Cohesion: 0.22
Nodes (11): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), NavLinks(), requireLabel(), requireUser() (+3 more)

### Community 37 - "order-actions.ts"
Cohesion: 0.14
Nodes (20): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, initialState, OrderCancelForm() (+12 more)

### Community 38 - "storage.ts"
Cohesion: 0.20
Nodes (18): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+10 more)

### Community 39 - "auth.ts"
Cohesion: 0.22
Nodes (15): RegisterPage(), initialState, LoginForm(), initialState, RegisterForm(), AuthActionState, mapAuthError(), readString() (+7 more)

### Community 40 - "orders/[id]/page.tsx"
Cohesion: 0.22
Nodes (14): OrderDetailPage(), OrderDetailPageProps, OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod() (+6 more)

### Community 41 - "profiles.ts"
Cohesion: 0.24
Nodes (14): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), defaultDisplayName(), getOwnProfile() (+6 more)

### Community 42 - "services/index.ts"
Cohesion: 0.37
Nodes (11): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+3 more)

### Community 43 - "platform-settings.ts"
Cohesion: 0.54
Nodes (7): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables()

### Community 44 - "bank/page.tsx"
Cohesion: 0.40
Nodes (4): CheckoutContinuationPageProps, ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

## Knowledge Gaps
- **286 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+281 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `cn`, `recovery.ts`, `types/index.ts`, `products.ts`, `roles.ts`, `storage.ts`, `auth.ts`, `orders/[id]/page.tsx`, `profiles.ts`, `services/index.ts`, `bank/page.tsx`, `cart.ts`, `orders.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Button()` connect `cn` to `recovery.ts`, `types/index.ts`, `products.ts`, `order-actions.ts`, `orders/[id]/page.tsx`, `error-fallback.tsx`, `cart.ts`, `getLoggedInUser`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `cart.ts` to `appwrite/index.ts`, `cn`, `recovery.ts`, `types/index.ts`, `storage.ts`, `auth.ts`, `orders/[id]/page.tsx`, `profiles.ts`, `services/index.ts`, `platform-settings.ts`, `getLoggedInUser`, `orders.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _286 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05355276907001045 - nodes in this community are weakly interconnected._
- **Should `recovery.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07616892911010557 - nodes in this community are weakly interconnected._