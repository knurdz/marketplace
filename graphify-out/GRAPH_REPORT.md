# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 142 files · ~54,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 975 nodes · 2464 edges · 50 communities (39 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26a58a7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- setup-mvp-schema.mjs
- auth.ts
- devDependencies
- compilerOptions
- dependencies
- cn
- types/payhere.ts
- Tables (17)
- components.json
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seed-demo.mjs
- Work Distribution — Knurdz Marketplace
- services/index.ts
- uploads.ts
- PayHere contract (Knurdz Marketplace)
- error-fallback.tsx
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- devDependencies
- AGENTS.md
- cart.ts
- orders.ts
- order-actions.ts
- status.ts
- types/index.ts
- bank/page.tsx
- getOwnOrder
- notification-bell.tsx
- roles.ts
- shadcn
- getLoggedInUser
- button.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- order-display.ts
- (store)/layout.tsx
- scripts
- app/layout.tsx
- free-order.ts
- orders/[id]/page.tsx
- wishlist-list.tsx
- package.json
- lucide-react
- react-dom
- sonner
- tailwind-merge

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 71 edges
2. `createSessionClient()` - 50 edges
3. `hasAppwritePublicConfig()` - 33 edges
4. `Button()` - 29 edges
5. `cn()` - 29 edges
6. `getOwnOrder()` - 24 edges
7. `createAdminClient()` - 21 edges
8. `getOwnPaymentForOrder()` - 21 edges
9. `Tables (17)` - 18 edges
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

## Communities (50 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.05
Nodes (84): AdminPage(), formatCount(), formatRevenue(), AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts() (+76 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (44): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+36 more)

### Community 3 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, clsx, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 6 - "cn"
Cohesion: 0.18
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, Input(), Separator(), Sheet(), SheetContent() (+8 more)

### Community 7 - "types/payhere.ts"
Cohesion: 0.11
Nodes (24): PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), Order, FIELD_KEYS (+16 more)

### Community 8 - "Tables (17)"
Cohesion: 0.08
Nodes (26): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+18 more)

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

### Community 13 - "services/index.ts"
Cohesion: 0.05
Nodes (86): CategoriesPage(), CategoryPage(), Home(), HomeProps, ProductPage(), ProductPageProps, SearchPage(), SearchPageProps (+78 more)

### Community 14 - "uploads.ts"
Cohesion: 0.62
Nodes (6): publicImagePermissions(), uploadAvatar(), uploadBankSlip(), uploadFile(), uploadProductImage(), validateUpload()

### Community 15 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.05
Nodes (39): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session), Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`) (+31 more)

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

### Community 23 - "orders.ts"
Cohesion: 0.13
Nodes (27): CancelOrderResult, CreateOrderActionState, CreateOrderInput, CreateOrderResult, ORDER_ERROR_CODES, OrderErrorCode, SubmitBankSlipInput, SubmitBankSlipResult (+19 more)

### Community 24 - "order-actions.ts"
Cohesion: 0.12
Nodes (21): CheckoutContinuationPageProps, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS, FreeOrderConfirmForm(), FreeOrderConfirmFormProps, initialState (+13 more)

### Community 25 - "status.ts"
Cohesion: 0.11
Nodes (22): ACTIVE_PRODUCT_STATUS, BANK_SLIP_STATUSES, HAPPY_PATH, isBankSlipStatus(), isOneOf(), isOrderStatus(), isPaymentMethod(), isPaymentStatus() (+14 more)

### Community 26 - "types/index.ts"
Cohesion: 0.19
Nodes (18): BankSlip, Cart, CartItem, CartLine, CartLineIssue, OrderItem, Payment, Report (+10 more)

### Community 27 - "bank/page.tsx"
Cohesion: 0.21
Nodes (9): CheckoutContinuationPageProps, BankSlipUploadForm(), BankSlipUploadFormProps, initialState, ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey, submitBankSlipAction() (+1 more)

### Community 28 - "getOwnOrder"
Cohesion: 0.24
Nodes (13): CheckoutBankPage(), CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps, CheckoutContinuationPageProps, CheckoutPayHerePage(), PayHereReturnPage(), PayHereReturnPageProps (+5 more)

### Community 29 - "notification-bell.tsx"
Cohesion: 0.20
Nodes (13): formatRelative(), NotificationBell(), Badge(), badgeVariants, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+5 more)

### Community 30 - "roles.ts"
Cohesion: 0.22
Nodes (11): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), NavLinks(), requireLabel(), requireUser() (+3 more)

### Community 32 - "getLoggedInUser"
Cohesion: 0.31
Nodes (8): LoginPage(), safeNextPath(), CartPage(), CheckoutPage(), OrdersPage(), getLoggedInUser(), getCart(), listOwnOrders()

### Community 33 - "button.tsx"
Cohesion: 0.22
Nodes (9): CategoryPageProps, ProductCatalogFilters(), ProductCatalogFiltersProps, SORT_OPTIONS, WishlistRemoveButtonProps, Button(), buttonVariants, Label() (+1 more)

### Community 38 - "order-display.ts"
Cohesion: 0.23
Nodes (11): OrderListRow(), OrderListRowProps, OrderTimeline(), OrderTimelineProps, formatOrderStatus(), formatPaymentMethod(), ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS (+3 more)

### Community 39 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 40 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 42 - "free-order.ts"
Cohesion: 0.40
Nodes (5): confirmFreeOrder(), normalizeOrderId(), NOT_CONFIGURED, ConfirmFreeOrderRequest, ConfirmFreeOrderResult

### Community 43 - "orders/[id]/page.tsx"
Cohesion: 0.60
Nodes (4): OrderDetailPage(), OrderDetailPageProps, getOwnOrderItems(), isOrderCancelable()

### Community 44 - "wishlist-list.tsx"
Cohesion: 0.50
Nodes (4): issueLabel(), WishlistList(), WishlistListProps, WishlistRemoveButton()

### Community 45 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **290 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+285 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `getLoggedInUser` to `appwrite/index.ts`, `auth.ts`, `(store)/layout.tsx`, `types/payhere.ts`, `free-order.ts`, `orders/[id]/page.tsx`, `services/index.ts`, `uploads.ts`, `cart.ts`, `orders.ts`, `order-actions.ts`, `bank/page.tsx`, `getOwnOrder`, `roles.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `getLoggedInUser`, `cn`, `types/payhere.ts`, `orders/[id]/page.tsx`, `services/index.ts`, `error-fallback.tsx`, `cart.ts`, `order-actions.ts`, `bank/page.tsx`, `getOwnOrder`, `notification-bell.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `cart.ts` to `appwrite/index.ts`, `getLoggedInUser`, `auth.ts`, `cn`, `types/payhere.ts`, `orders/[id]/page.tsx`, `services/index.ts`, `uploads.ts`, `orders.ts`, `getOwnOrder`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _290 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05022404779686333 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07364114552893045 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._