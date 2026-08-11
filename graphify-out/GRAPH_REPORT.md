# Graph Report - .  (2026-08-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 416 nodes · 711 edges · 28 communities (20 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d1504dfd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- setup-mvp-schema.mjs
- rate-limit.ts
- index.ts
- devDependencies
- compilerOptions
- dependencies
- index.ts
- components.json
- config.ts
- seed-demo.mjs
- storage.ts
- products.ts
- setup-storage-buckets.mjs
- page.tsx
- page.tsx
- roles.ts
- page.tsx
- page.tsx
- page.tsx
- shadcn
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 20 edges
2. `compilerOptions` - 16 edges
3. `waitColumnsAvailable()` - 16 edges
4. `ensureTable()` - 15 edges
5. `ensureString()` - 15 edges
6. `ensureIndex()` - 15 edges
7. `main()` - 15 edges
8. `assertRateLimit()` - 11 edges
9. `setupProducts()` - 10 edges
10. `setupCartItems()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `ResendVerificationForm()` --indirect_call--> `requestEmailVerification()`  [INFERRED]
  components/auth/resend-verification-form.tsx → lib/appwrite/recovery.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `ProfileForm()` --indirect_call--> `updateOwnAvatar()`  [INFERRED]
  components/auth/profile-form.tsx → lib/appwrite/profiles.ts
- `ProfileForm()` --indirect_call--> `updateOwnProfile()`  [INFERRED]
  components/auth/profile-form.tsx → lib/appwrite/profiles.ts
- `SideNav()` --calls--> `cn()`  [EXTRACTED]
  components/layout/portal-shell.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (28 total, 8 thin omitted)

### Community 0 - "cn"
Cohesion: 0.09
Nodes (26): ADMIN_NAV, jetbrainsMono, metadata, RootLayout(), spaceGrotesk, SELLER_NAV, PortalNavItem, PortalShell() (+18 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (36): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+28 more)

### Community 2 - "rate-limit.ts"
Cohesion: 0.13
Nodes (30): initialState, ResendVerificationForm(), AuthActionState, mapAuthError(), readString(), rollbackSignup(), safeNextPath(), setSessionCookie() (+22 more)

### Community 3 - "index.ts"
Cohesion: 0.13
Nodes (33): BankSlip, Category, Order, OrderItem, Payment, Product, ProductImage, Report (+25 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+24 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (27): appwrite, class-variance-authority, clsx, lucide-react, next, node-appwrite, devDependencies, shadcn (+19 more)

### Community 7 - "index.ts"
Cohesion: 0.23
Nodes (17): AccountPage(), avatarInitial, initialState, ProfileForm(), asProfile(), createProfileForUser(), defaultDisplayName(), getOwnProfile() (+9 more)

### Community 8 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "config.ts"
Cohesion: 0.16
Nodes (13): getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, getAppwriteEndpoint(), getAppwriteProjectId() (+5 more)

### Community 10 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (17): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureCategory(), ensureProduct() (+9 more)

### Community 11 - "storage.ts"
Cohesion: 0.23
Nodes (14): bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf(), publicImagePermissions(), toInputFile(), uploadAvatar(), uploadBankSlip() (+6 more)

### Community 12 - "products.ts"
Cohesion: 0.30
Nodes (10): Home(), createPublicClient(), asBoolean(), asNullableString(), asNumber(), asProduct(), getProduct(), isPubliclyListed() (+2 more)

### Community 13 - "setup-storage-buckets.mjs"
Cohesion: 0.24
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 14 - "page.tsx"
Cohesion: 0.47
Nodes (4): LoginPage(), safeNextPath(), initialState, LoginForm()

### Community 15 - "page.tsx"
Cohesion: 0.40
Nodes (3): SearchParams, initialState, ResetPasswordForm()

### Community 16 - "roles.ts"
Cohesion: 0.47
Nodes (5): requireLabel(), requireUser(), ROLE_LABELS, RoleLabel, userHasLabel()

## Knowledge Gaps
- **139 isolated node(s):** `npx`, `eslintConfig`, `nextConfig`, `config`, `target` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `npx`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.0919661733615222 - nodes in this community are weakly interconnected._
- **Should `rate-limit.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._