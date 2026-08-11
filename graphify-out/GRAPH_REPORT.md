# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 141 files · ~53,712 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 963 nodes · 2421 edges · 62 communities (51 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `662ec74d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- button.tsx
- auth.ts
- types/index.ts
- products.ts
- PayHere contract (Knurdz Marketplace)
- setup-mvp-schema.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- devDependencies
- dependencies
- compilerOptions
- Tables (17)
- Work Distribution — Knurdz Marketplace
- components.json
- seed-demo.mjs
- error-fallback.tsx
- cart.ts
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- scripts
- getOwnOrder
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
- createAdminClient
- roles.ts
- order-cancel-form.tsx
- services/index.ts
- wishlist.ts
- order-display.ts
- profiles.ts
- appwrite/notifications.ts
- platform-settings.ts
- bank/page.tsx
- lucide-react
- cn
- getLoggedInUser
- notification-bell.tsx
- products/[id]/page.tsx
- (store)/layout.tsx
- Knurdz Marketplace
- free-order-confirm-form.tsx
- app/layout.tsx
- 5. Member 1 — Core infrastructure (critical path)
- 6. Member 2 — Buyer / storefront
- 8. Member 4 — Admin, moderation, trust
- Agent reference docs
- 3. Shared contracts (do not fork)
- 7. Member 3 — Seller portal
- 2. Technical stack (detail)

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 71 edges
2. `createSessionClient()` - 50 edges
3. `hasAppwritePublicConfig()` - 31 edges
4. `Button()` - 29 edges
5. `cn()` - 29 edges
6. `getOwnOrder()` - 24 edges
7. `getOwnPaymentForOrder()` - 21 edges
8. `Tables (17)` - 18 edges
9. `createAdminClient()` - 17 edges
10. `assertRateLimit()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `PopoverDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/popover.tsx → lib/utils.ts
- `AccountPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts

## Import Cycles
- None detected.

## Communities (62 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.11
Nodes (33): getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS (+25 more)

### Community 1 - "button.tsx"
Cohesion: 0.14
Nodes (19): CategoryPageProps, HomeProps, SearchPageProps, BankSlipUploadFormProps, initialState, CheckoutForm(), CheckoutFormProps, initialState (+11 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (45): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+37 more)

### Community 3 - "types/index.ts"
Cohesion: 0.06
Nodes (70): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), asBankSlip(), asNullableString(), asNumber(), asOrder(), asOrderItem() (+62 more)

### Community 4 - "products.ts"
Cohesion: 0.17
Nodes (21): CategoryPage(), Home(), SearchPage(), asBoolean(), asNullableString(), asNumber(), asProduct(), asProductImage() (+13 more)

### Community 5 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.20
Nodes (10): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 4. How agents should work (all members), 9. Integration map (who waits on whom), Knurdz Marketplace — Member Implementation Guide (Agent Reference), Per-step loop (mandatory) (+2 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, clsx, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.07
Nodes (27): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+19 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 16 - "cart.ts"
Cohesion: 0.11
Nodes (42): CartPage(), CheckoutPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps (+34 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 21 - "getOwnOrder"
Cohesion: 0.20
Nodes (16): PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage(), PayHereReturnPage(), PayHereReturnPageProps, OrderDetailPage(), OrderDetailPageProps (+8 more)

### Community 29 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 30 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 31 - "orders.ts"
Cohesion: 0.15
Nodes (24): CancelOrderActionState, CancelOrderResult, ConfirmFreeOrderActionState, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode (+16 more)

### Community 35 - "createAdminClient"
Cohesion: 0.27
Nodes (10): SellerInfoCard(), SellerInfoCardProps, createAdminClient(), deleteFileAsAdmin(), asNullableString(), CheckoutSellerBankDetails, getPublicSellerByUserId(), getSellerBankDetailsForCheckout() (+2 more)

### Community 36 - "roles.ts"
Cohesion: 0.22
Nodes (11): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), NavLinks(), requireLabel(), requireUser() (+3 more)

### Community 37 - "order-cancel-form.tsx"
Cohesion: 0.25
Nodes (8): BankSlipUploadForm(), initialState, OrderCancelForm(), OrderCancelFormProps, cancelOrderAction(), revalidateCheckoutPaths(), revalidateOrderPaths(), submitBankSlipAction()

### Community 38 - "services/index.ts"
Cohesion: 0.24
Nodes (16): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), extensionOf(), publicImagePermissions(), toInputFile() (+8 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.09
Nodes (40): CategoriesPage(), issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton(), WishlistRemoveButtonProps, WishlistToggleButton(), WishlistToggleButtonProps (+32 more)

### Community 40 - "order-display.ts"
Cohesion: 0.24
Nodes (10): OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod(), ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS (+2 more)

### Community 41 - "profiles.ts"
Cohesion: 0.22
Nodes (16): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+8 more)

### Community 42 - "appwrite/notifications.ts"
Cohesion: 0.31
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 43 - "platform-settings.ts"
Cohesion: 0.38
Nodes (9): DATABASE_ID, asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables() (+1 more)

### Community 44 - "bank/page.tsx"
Cohesion: 0.33
Nodes (5): CheckoutBankPage(), CheckoutContinuationPageProps, ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

### Community 46 - "cn"
Cohesion: 0.17
Nodes (17): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, Badge(), badgeVariants, Separator(), Sheet() (+9 more)

### Community 47 - "getLoggedInUser"
Cohesion: 0.23
Nodes (11): LoginPage(), safeNextPath(), OrdersPage(), getLoggedInUser(), confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, listOwnOrders() (+3 more)

### Community 48 - "notification-bell.tsx"
Cohesion: 0.24
Nodes (11): formatRelative(), NotificationBell(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger() (+3 more)

### Community 49 - "products/[id]/page.tsx"
Cohesion: 0.26
Nodes (9): ProductPage(), ProductPageProps, WishlistPage(), ProductImageGallery(), ProductImageGalleryProps, ProductReviewsPlaceholder(), BUCKET_PRODUCT_IMAGES, getFilePreviewUrl() (+1 more)

### Community 50 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 51 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 52 - "free-order-confirm-form.tsx"
Cohesion: 0.28
Nodes (7): CheckoutContinuationPageProps, CheckoutFreePage(), FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState, confirmFreeOrderAction(), Order

### Community 53 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 55 - "5. Member 1 — Core infrastructure (critical path)"
Cohesion: 0.33
Nodes (6): 5. Member 1 — Core infrastructure (critical path), Blocker rule, Dependencies, Member 1 — Definition of done, Step-by-step plan (small slices), You are building

### Community 56 - "6. Member 2 — Buyer / storefront"
Cohesion: 0.33
Nodes (6): 6. Member 2 — Buyer / storefront, Dependencies, Member 2 — Agent sub-prompt example, Member 2 — Definition of done, Step-by-step plan, You are building

### Community 57 - "8. Member 4 — Admin, moderation, trust"
Cohesion: 0.33
Nodes (6): 8. Member 4 — Admin, moderation, trust, Dependencies, Member 4 — Critical security steps (never skip), Member 4 — Definition of done, Step-by-step plan, You are building

### Community 58 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

### Community 59 - "3. Shared contracts (do not fork)"
Cohesion: 0.40
Nodes (5): 3. Shared contracts (do not fork), Agent rules every step, Minimum collections (Member 1 creates), Ownership of payments, Status enums

### Community 60 - "7. Member 3 — Seller portal"
Cohesion: 0.40
Nodes (5): 7. Member 3 — Seller portal, Dependencies, Member 3 — Definition of done, Step-by-step plan, You are building

### Community 61 - "2. Technical stack (detail)"
Cohesion: 0.50
Nodes (4): 2. Technical stack (detail), Approved MCPs (agents), Suggested env (Member 1 defines `.env.example`), Suggested folder layout (Member 1 establishes; others follow)

## Knowledge Gaps
- **290 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+285 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `button.tsx`, `auth.ts`, `types/index.ts`, `roles.ts`, `services/index.ts`, `wishlist.ts`, `profiles.ts`, `appwrite/notifications.ts`, `bank/page.tsx`, `cart.ts`, `products/[id]/page.tsx`, `(store)/layout.tsx`, `free-order-confirm-form.tsx`, `getOwnOrder`, `orders.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `types/index.ts`, `order-cancel-form.tsx`, `wishlist.ts`, `cn`, `getLoggedInUser`, `cart.ts`, `products/[id]/page.tsx`, `notification-bell.tsx`, `error-fallback.tsx`, `free-order-confirm-form.tsx`, `getOwnOrder`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `cart.ts` to `appwrite/index.ts`, `auth.ts`, `types/index.ts`, `services/index.ts`, `wishlist.ts`, `profiles.ts`, `appwrite/notifications.ts`, `platform-settings.ts`, `cn`, `getLoggedInUser`, `getOwnOrder`, `orders.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _290 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1141025641025641 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07231638418079096 - nodes in this community are weakly interconnected._