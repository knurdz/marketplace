# Graph Report - knurdz-marketplace  (2026-08-11)

## Corpus Check
- 98 files · ~38,221 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 718 nodes · 1496 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9efe3886`
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
- types/index.ts
- Tables (16)
- components.json
- Knurdz Marketplace — Member Implementation Guide (Agent Reference)
- seed-demo.mjs
- Work Distribution — Knurdz Marketplace
- products.ts
- services/index.ts
- PayHere contract (Knurdz Marketplace)
- error-fallback.tsx
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- devDependencies
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
4. `createAdminClient()` - 18 edges
5. `Tables (16)` - 17 edges
6. `waitColumnsAvailable()` - 16 edges
7. `ensureString()` - 16 edges
8. `compilerOptions` - 16 edges
9. `ensureTable()` - 15 edges
10. `ensureIndex()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `RegisterPage()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(auth)/register/page.tsx → lib/appwrite/session.ts
- `StoreLayout()` --calls--> `getLoggedInUser()`  [EXTRACTED]
  app/(store)/layout.tsx → lib/appwrite/session.ts
- `AccountPage()` --calls--> `getAvatarPreviewUrl()`  [EXTRACTED]
  app/(auth)/account/page.tsx → lib/appwrite/storage-urls.ts
- `VerifyEmailPage()` --calls--> `completeEmailVerification()`  [EXTRACTED]
  app/(auth)/verify-email/page.tsx → lib/appwrite/recovery.ts
- `Home()` --calls--> `getSessionUser()`  [EXTRACTED]
  app/(store)/page.tsx → lib/services/session.ts

## Import Cycles
- None detected.

## Communities (28 total, 7 thin omitted)

### Community 0 - "appwrite/index.ts"
Cohesion: 0.07
Nodes (53): AdminPage(), formatCount(), formatRevenue(), getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, AVATAR_MAX_BYTES (+45 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (37): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+29 more)

### Community 2 - "auth.ts"
Cohesion: 0.07
Nodes (47): RegisterPage(), SearchParams, SearchParams, VerifyEmailPage(), ForgotPasswordForm(), initialState, initialState, LoginForm() (+39 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+24 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (27): appwrite, class-variance-authority, clsx, lucide-react, next, node-appwrite, dependencies, appwrite (+19 more)

### Community 6 - "cn"
Cohesion: 0.06
Nodes (54): ADMIN_NAV, AdminLayout(), jetbrainsMono, metadata, RootLayout(), spaceGrotesk, SELLER_NAV, SellerLayout() (+46 more)

### Community 7 - "types/index.ts"
Cohesion: 0.07
Nodes (56): mapExecutionError(), normalizePayHereOrderId(), requestPayHereCheckout(), BankSlip, Category, Notification, Order, OrderItem (+48 more)

### Community 8 - "Tables (16)"
Cohesion: 0.05
Nodes (40): Agent reference docs, By member, Non-negotiables, Phase 0 status, Read order (every agent session), Abuse guards (step 1.14), `audit_logs`, Auth roles (labels) (+32 more)

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
Cohesion: 0.08
Nodes (26): Change log, Creative & advanced backlog (do not duplicate into MVP lanes), Development phases (team sync), Member 1 — done when, Member 1 — Foundation (must-dos first), Member 2 — Buyer / storefront, Member 2 — verification extras, Member 3 — Seller portal (+18 more)

### Community 13 - "products.ts"
Cohesion: 0.29
Nodes (13): Home(), SearchPage(), hasAppwritePublicConfig(), asBoolean(), asNullableString(), asNumber(), asProduct(), getProduct() (+5 more)

### Community 14 - "services/index.ts"
Cohesion: 0.09
Nodes (49): AccountPage(), LoginPage(), safeNextPath(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asNotification() (+41 more)

### Community 15 - "PayHere contract (Knurdz Marketplace)"
Cohesion: 0.08
Nodes (24): Checkout URLs, Environment, Fields (see `PAYHERE_NOTIFY_FIELDS`), Free confirm (not a PayHere Function), Free path, Function IDs, Hash formula (server-only), Hash Function (+16 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.22
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 20 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 27 - "keys.ts"
Cohesion: 0.50
Nodes (3): ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

## Knowledge Gaps
- **248 isolated node(s):** `npx`, `SearchParams`, `SearchParams`, `SearchPageProps`, `ADMIN_NAV` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getLoggedInUser()` connect `services/index.ts` to `appwrite/index.ts`, `auth.ts`, `cn`, `types/index.ts`, `products.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` connect `Knurdz Marketplace — Member Implementation Guide (Agent Reference)` to `Tables (16)`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `npx`, `SearchParams`, `SearchParams` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appwrite/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07139079851930195 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07086197778952935 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._