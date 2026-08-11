# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 113 files · ~43,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 803 nodes · 1817 edges · 35 communities (24 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f9105522`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appwrite/index.ts
- cn
- auth.ts
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
- keys.ts
- shadcn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- package.json
- devDependencies
- clsx
- react-dom
- sonner
- tailwind-merge

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 41 edges
2. `createSessionClient()` - 36 edges
3. `cn()` - 29 edges
4. `hasAppwritePublicConfig()` - 18 edges
5. `Button()` - 17 edges
6. `Tables (16)` - 17 edges
7. `createPublicClient()` - 16 edges
8. `createAdminClient()` - 16 edges
9. `waitColumnsAvailable()` - 16 edges
10. `ensureString()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `LoginPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/login/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `CartPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(store)/cart/page.tsx → lib/appwrite/session.ts
- `CategoriesPage()` --calls--> `listCategories()`  [EXTRACTED]
  app/(store)/categories/page.tsx → lib/services/categories.ts

## Import Cycles
- None detected.

## Communities (35 total, 11 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.05
Nodes (94): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), ProductImageGallery(), ProductImageGalleryProps, getBrowserAccount() (+86 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (56): ADMIN_NAV, AdminLayout(), jetbrainsMono, metadata, RootLayout(), spaceGrotesk, SELLER_NAV, SellerLayout() (+48 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (46): LoginPage(), safeNextPath(), RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState (+38 more)

### Community 3 - "types/index.ts"
Cohesion: 0.07
Nodes (62): mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), BankSlip, Cart, CartItem, CartLine, CartLineIssue (+54 more)

### Community 4 - "products.ts"
Cohesion: 0.08
Nodes (41): CategoriesPage(), CategoryPage(), CategoryPageProps, Home(), HomeProps, ProductPage(), ProductPageProps, SearchPage() (+33 more)

### Community 5 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.05
Nodes (39): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session), Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`) (+31 more)

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
Nodes (19): appwrite, class-variance-authority, lucide-react, next, node-appwrite, dependencies, appwrite, class-variance-authority (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 11 - "Tables (16)"
Cohesion: 0.08
Nodes (25): Abuse guards (step 1.14), `audit_logs`, Auth roles (labels), `bank_slips`, `cart_items`, `carts`, `categories`, Changelog (+17 more)

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
Cohesion: 0.12
Nodes (41): CartPage(), AddToCartButton(), AddToCartButtonProps, CartContents(), CartContentsProps, CartLineRow(), CartLineRowProps, issueLabel() (+33 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, seed, start

### Community 21 - "keys.ts"
Cohesion: 0.50
Nodes (3): ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

### Community 29 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 30 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

## Knowledge Gaps
- **261 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `HomeProps` (+256 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `appwrite/index.ts` to `cn`, `auth.ts`, `types/index.ts`, `products.ts`, `cart.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `cn` to `cart.ts`, `products.ts`, `error-fallback.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` connect `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` to `PayHere contract (Knurdz Marketplace)`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _261 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053744748660002895 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05389942788316772 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06927551560021153 - nodes in this community are weakly interconnected._