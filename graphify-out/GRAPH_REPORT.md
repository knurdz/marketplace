# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 148 files · ~56,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1012 nodes · 2609 edges · 56 communities (45 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c34f8143`
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
- createSessionClient
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- scripts
- DATABASE_ID
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
- reviews.ts
- roles.ts
- bank-slip-upload-form.tsx
- storage.ts
- wishlist.ts
- Knurdz Marketplace — Appwrite SCHEMA (frozen)
- profiles.ts
- services/index.ts
- platform-settings.ts
- Member 1 — Foundation (must-dos first)
- Member 3 — Seller portal
- portal-shell.tsx
- Member 4 — Admin, moderation, trust
- cn
- server.ts
- (store)/layout.tsx
- Knurdz Marketplace
- clsx
- app/layout.tsx
- Agent reference docs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 76 edges
2. `createSessionClient()` - 54 edges
3. `hasAppwritePublicConfig()` - 38 edges
4. `Button()` - 31 edges
5. `cn()` - 29 edges
6. `getOwnOrder()` - 24 edges
7. `assertRateLimit()` - 21 edges
8. `getOwnPaymentForOrder()` - 21 edges
9. `getProduct()` - 21 edges
10. `createPublicClient()` - 19 edges

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

## Communities (56 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.12
Nodes (28): ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES, BANK_SLIP_MAX_BYTES, BUCKET_AVATARS, BUCKET_BANK_SLIPS, BUCKET_PRODUCT_IMAGES, PRODUCT_IMAGE_MAX_BYTES (+20 more)

### Community 1 - "button.tsx"
Cohesion: 0.16
Nodes (17): CategoryPageProps, CheckoutPage(), HomeProps, SearchPageProps, CheckoutForm(), CheckoutFormProps, initialState, METHOD_LABELS (+9 more)

### Community 2 - "auth.ts"
Cohesion: 0.06
Nodes (58): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+50 more)

### Community 3 - "types/index.ts"
Cohesion: 0.05
Nodes (76): FreeOrderConfirmFormProps, initialState, PayHereCheckoutForm(), PayHereCheckoutFormProps, submitPayHereCheckoutForm(), issueLabel(), WishlistList(), WishlistListProps (+68 more)

### Community 4 - "products.ts"
Cohesion: 0.16
Nodes (22): CategoryPage(), Home(), SearchPage(), getCategoryBySlug(), asBoolean(), asNullableString(), asNumber(), asProduct() (+14 more)

### Community 5 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 6 - "setup-mvp-schema.mjs"
Cohesion: 0.18
Nodes (38): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+30 more)

### Community 7 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+13 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (19): appwrite, class-variance-authority, lucide-react, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "Tables (17)"
Cohesion: 0.11
Nodes (18): `audit_logs`, `bank_slips`, `cart_items`, `carts`, `categories`, `notifications`, `order_items`, `orders` (+10 more)

### Community 12 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.15
Nodes (13): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 2 — Buyer / storefront, Member 2 — verification extras, Principles, Risks (track while implementing), Shared post-implementation checklist (all members) (+5 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 16 - "createSessionClient"
Cohesion: 0.12
Nodes (42): CartPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+34 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, seed, start (+1 more)

### Community 21 - "DATABASE_ID"
Cohesion: 0.39
Nodes (6): CategoriesPage(), DATABASE_ID, asCategory(), asNullableString(), asNumber(), listCategories()

### Community 29 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 30 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 31 - "orders.ts"
Cohesion: 0.06
Nodes (74): LoginPage(), safeNextPath(), CheckoutBankPage(), CheckoutContinuationPageProps, CheckoutContinuationPageProps, CheckoutFreePage(), PayHereCancelPage(), PayHereCancelPageProps (+66 more)

### Community 35 - "reviews.ts"
Cohesion: 0.08
Nodes (37): ProductPage(), ProductPageProps, ProductImageGallery(), ProductImageGalleryProps, ProductReviewsPlaceholder(), ProductReviewsPlaceholderProps, SellerInfoCard(), SellerInfoCardProps (+29 more)

### Community 36 - "roles.ts"
Cohesion: 0.22
Nodes (11): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), NavLinks(), requireLabel(), requireUser() (+3 more)

### Community 37 - "bank-slip-upload-form.tsx"
Cohesion: 0.15
Nodes (12): BankSlipUploadForm(), BankSlipUploadFormProps, initialState, initialState, OrderCancelForm(), OrderCancelFormProps, WishlistRemoveButtonProps, cancelOrderAction() (+4 more)

### Community 38 - "storage.ts"
Cohesion: 0.20
Nodes (18): BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf() (+10 more)

### Community 39 - "wishlist.ts"
Cohesion: 0.15
Nodes (25): WishlistRemoveButton(), WishlistToggleButton(), WishlistToggleButtonProps, TABLE_WISHLIST_ITEMS, addToWishlist(), removeFromWishlist(), revalidateWishlistPaths(), toggleWishlistProduct() (+17 more)

### Community 40 - "Knurdz Marketplace — Appwrite SCHEMA (frozen)"
Cohesion: 0.25
Nodes (8): Abuse guards (step 1.14), Auth roles (labels), Changelog, Connection, Console match checklist, Knurdz Marketplace — Appwrite SCHEMA (frozen), Status / method enums (canonical), Storage (step 1.8)

### Community 41 - "profiles.ts"
Cohesion: 0.23
Nodes (15): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+7 more)

### Community 42 - "services/index.ts"
Cohesion: 0.34
Nodes (12): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+4 more)

### Community 43 - "platform-settings.ts"
Cohesion: 0.54
Nodes (7): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), parsePlatformSettingJson(), withSessionTables()

### Community 44 - "Member 1 — Foundation (must-dos first)"
Cohesion: 0.33
Nodes (6): Member 1 — done when, Member 1 — Foundation (must-dos first), Payment setup (Member 1 — was formerly Members 2 + 4), Phase 0 — blockers (do before others ship against APIs), Phase 0 — step-by-step plan (implement one step at a time), Phase 1 — ongoing

### Community 45 - "Member 3 — Seller portal"
Cohesion: 0.50
Nodes (4): Member 3 — Seller portal, Member 3 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 46 - "portal-shell.tsx"
Cohesion: 0.16
Nodes (16): PortalNavItem, PortalShellProps, SideNav(), StoreNavbarProps, ReportListingButton(), ReportListingButtonProps, Sheet(), SheetContent() (+8 more)

### Community 47 - "Member 4 — Admin, moderation, trust"
Cohesion: 0.50
Nodes (4): Member 4 — Admin, moderation, trust, Member 4 — verification extras, Step-by-step plan (implement one step at a time), Tasks

### Community 48 - "cn"
Cohesion: 0.20
Nodes (16): formatRelative(), NotificationBell(), Badge(), badgeVariants, Label(), Popover(), PopoverContent(), PopoverDescription() (+8 more)

### Community 49 - "server.ts"
Cohesion: 0.30
Nodes (10): WishlistPage(), getBrowserAccount(), getBrowserClient(), getAppwriteEndpoint(), getAppwriteProjectId(), getAvatarViewUrl(), getFilePreviewUrl(), getFileViewUrl() (+2 more)

### Community 50 - "(store)/layout.tsx"
Cohesion: 0.27
Nodes (5): StoreLayout(), SkipToContent(), FOOTER_LINKS, StoreFooter(), StoreNavbar()

### Community 51 - "Knurdz Marketplace"
Cohesion: 0.20
Nodes (10): Agent / quality rules, Appwrite setup, Auth routes, Demo seed (dev / sandbox only), Getting started, Knurdz Marketplace, Payments (MVP), Portals (+2 more)

### Community 53 - "app/layout.tsx"
Cohesion: 0.33
Nodes (5): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Toaster()

### Community 58 - "Agent reference docs"
Cohesion: 0.40
Nodes (5): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session)

## Knowledge Gaps
- **293 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `CheckoutContinuationPageProps` (+288 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `orders.ts` to `appwrite/index.ts`, `button.tsx`, `auth.ts`, `reviews.ts`, `roles.ts`, `types/index.ts`, `storage.ts`, `wishlist.ts`, `profiles.ts`, `services/index.ts`, `createSessionClient`, `server.ts`, `(store)/layout.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `reviews.ts`, `types/index.ts`, `bank-slip-upload-form.tsx`, `wishlist.ts`, `portal-shell.tsx`, `error-fallback.tsx`, `createSessionClient`, `server.ts`, `cn`, `DATABASE_ID`, `orders.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `createSessionClient()` connect `createSessionClient` to `appwrite/index.ts`, `auth.ts`, `types/index.ts`, `reviews.ts`, `storage.ts`, `wishlist.ts`, `profiles.ts`, `services/index.ts`, `platform-settings.ts`, `portal-shell.tsx`, `server.ts`, `orders.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _293 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11895161290322581 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058596491228070174 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050774526678141134 - nodes in this community are weakly interconnected._