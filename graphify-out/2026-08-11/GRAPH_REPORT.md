# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 101 files · ~38,751 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 721 nodes · 1507 edges · 29 communities (22 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2551f56c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setup-mvp-schema.mjs
- auth.ts
- devDependencies
- compilerOptions
- dependencies
- roles.ts
- types/index.ts
- appwrite/index.ts
- services/index.ts
- components.json
- cn
- Tables (16)
- seed-demo.mjs
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- Work Distribution — Knurdz Marketplace
- PayHere contract (Knurdz Marketplace)
- error-fallback.tsx
- devDependencies
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- AGENTS.md
- keys.ts
- shadcn
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getLoggedInUser()` - 34 edges
2. `cn()` - 29 edges
3. `createSessionClient()` - 26 edges
4. `Tables (16)` - 17 edges
5. `waitColumnsAvailable()` - 16 edges
6. `ensureString()` - 16 edges
7. `compilerOptions` - 16 edges
8. `hasAppwritePublicConfig()` - 15 edges
9. `createPublicClient()` - 15 edges
10. `ensureTable()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `StoreLayout()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(store)/layout.tsx → lib/appwrite/session.ts
- `LoginPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/login/page.tsx → lib/appwrite/session.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `CategoriesPage()` --calls--> `listCategories()`  [EXTRACTED]
  app/(store)/categories/page.tsx → lib/services/categories.ts

## Import Cycles
- None detected.

## Communities (29 total, 7 thin omitted)

### Community 0 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (37): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+29 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (46): LoginPage(), safeNextPath(), RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState (+38 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+24 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "dependencies"
Cohesion: 0.07
Nodes (27): appwrite, class-variance-authority, clsx, lucide-react, next, node-appwrite, dependencies, appwrite (+19 more)

### Community 5 - "roles.ts"
Cohesion: 0.22
Nodes (11): ADMIN_NAV, AdminLayout(), SELLER_NAV, SellerLayout(), PortalShell(), NavLinks(), requireLabel(), requireUser() (+3 more)

### Community 6 - "types/index.ts"
Cohesion: 0.07
Nodes (57): ProductListProps, mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), BankSlip, Category, Order, OrderItem (+49 more)

### Community 7 - "appwrite/index.ts"
Cohesion: 0.07
Nodes (73): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), signOut(), getBrowserAccount(), getBrowserClient() (+65 more)

### Community 8 - "services/index.ts"
Cohesion: 0.10
Nodes (42): CategoriesPage(), CategoryPage(), CategoryPageProps, Home(), SearchPage(), SearchPageProps, ProductList(), hasAppwritePublicConfig() (+34 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "cn"
Cohesion: 0.07
Nodes (41): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, StoreLayout(), PortalNavItem, PortalShellProps, SideNav() (+33 more)

### Community 11 - "Tables (16)"
Cohesion: 0.05
Nodes (40): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session), Abuse guards (step 1.14), `audit_logs`, Auth roles (labels) (+32 more)

### Community 12 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 13 - "Knurdz Marketplace — Member Implementation Guide (Agent Reference)"
Cohesion: 0.05
Nodes (42): 10. Cross-member E2E test script (Playwright MCP), 11. Quick “who owns what” cheat sheet, 12. How to use this with your agent, 1. What you are building, 2. Technical stack (detail), 3. Shared contracts (do not fork), 4. How agents should work (all members), 5. Member 1 — Core infrastructure (critical path) (+34 more)

### Community 14 - "Work Distribution — Knurdz Marketplace"
Cohesion: 0.07
Nodes (27): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+19 more)

### Community 15 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 17 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 19 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 20 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 29 - "keys.ts"
Cohesion: 0.50
Nodes (3): ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

## Knowledge Gaps
- **251 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `CategoryPageProps`, `SearchPageProps` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` connect `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` to `Tables (16)`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `getLoggedInUser()` connect `appwrite/index.ts` to `auth.ts`, `roles.ts`, `types/index.ts`, `services/index.ts`, `cn`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06927551560021153 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._