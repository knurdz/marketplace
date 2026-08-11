# Graph Report - .  (2026-08-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 453 nodes · 731 edges · 33 communities (24 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1754c6e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- storage.ts
- setup-mvp-schema.mjs
- devDependencies
- compilerOptions
- dependencies
- cn
- status.ts
- components.json
- portal-shell.tsx
- profiles.ts
- config.ts
- seed-demo.mjs
- products.ts
- notifications.ts
- index.ts
- setup-storage-buckets.mjs
- page.tsx
- page.tsx
- roles.ts
- page.tsx
- page.tsx
- page.tsx
- badge.tsx
- shadcn
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 18 edges
2. `compilerOptions` - 16 edges
3. `waitColumnsAvailable()` - 16 edges
4. `ensureString()` - 16 edges
5. `ensureTable()` - 15 edges
6. `ensureIndex()` - 15 edges
7. `main()` - 15 edges
8. `assertRateLimit()` - 11 edges
9. `setupProducts()` - 10 edges
10. `asNotification()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `ResendVerificationForm()` --indirect_call--> `requestEmailVerification()`  [INFERRED]
  components/auth/resend-verification-form.tsx → lib/appwrite/recovery.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `ProfileForm()` --indirect_call--> `updateOwnAvatar()`  [INFERRED]
  components/auth/profile-form.tsx → lib/appwrite/profiles.ts
- `ProfileForm()` --indirect_call--> `updateOwnProfile()`  [INFERRED]
  components/auth/profile-form.tsx → lib/appwrite/profiles.ts
- `Input()` --calls--> `cn()`  [EXTRACTED]
  components/ui/input.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (33 total, 9 thin omitted)

### Community 0 - "storage.ts"
Cohesion: 0.09
Nodes (44): initialState, ResendVerificationForm(), AuthActionState, mapAuthError(), readString(), rollbackSignup(), safeNextPath(), setSessionCookie() (+36 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (37): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+29 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+24 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 4 - "dependencies"
Cohesion: 0.07
Nodes (27): appwrite, class-variance-authority, clsx, lucide-react, next, node-appwrite, devDependencies, shadcn (+19 more)

### Community 5 - "cn"
Cohesion: 0.13
Nodes (16): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, Button(), buttonVariants, Input(), Label() (+8 more)

### Community 6 - "status.ts"
Cohesion: 0.10
Nodes (23): BANK_SLIP_STATUSES, BankSlipStatus, isBankSlipStatus(), isOneOf(), isOrderStatus(), isPaymentMethod(), isPaymentStatus(), isProductStatus() (+15 more)

### Community 7 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 8 - "portal-shell.tsx"
Cohesion: 0.12
Nodes (9): ADMIN_NAV, SELLER_NAV, PortalNavItem, PortalShell(), PortalShellProps, StoreNavbar(), StoreNavbarProps, formatRelative() (+1 more)

### Community 9 - "profiles.ts"
Cohesion: 0.19
Nodes (17): AccountPage(), avatarInitial, initialState, ProfileForm(), asProfile(), createProfileForUser(), defaultDisplayName(), getOwnProfile() (+9 more)

### Community 10 - "config.ts"
Cohesion: 0.15
Nodes (13): getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, getAppwriteEndpoint(), getAppwriteProjectId() (+5 more)

### Community 11 - "seed-demo.mjs"
Cohesion: 0.19
Nodes (18): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+10 more)

### Community 12 - "products.ts"
Cohesion: 0.25
Nodes (13): Home(), SearchPage(), SearchPageProps, asBoolean(), asNullableString(), asNumber(), asProduct(), getProduct() (+5 more)

### Community 13 - "notifications.ts"
Cohesion: 0.45
Nodes (11): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+3 more)

### Community 14 - "index.ts"
Cohesion: 0.32
Nodes (10): BankSlip, Category, Notification, Order, OrderItem, Payment, Product, ProductImage (+2 more)

### Community 15 - "setup-storage-buckets.mjs"
Cohesion: 0.24
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 17 - "page.tsx"
Cohesion: 0.47
Nodes (4): LoginPage(), safeNextPath(), initialState, LoginForm()

### Community 18 - "page.tsx"
Cohesion: 0.40
Nodes (3): SearchParams, initialState, ResetPasswordForm()

### Community 19 - "roles.ts"
Cohesion: 0.47
Nodes (5): requireLabel(), requireUser(), ROLE_LABELS, RoleLabel, userHasLabel()

## Knowledge Gaps
- **154 isolated node(s):** `npx`, `eslintConfig`, `nextConfig`, `config`, `target` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `npx`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `storage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08521870286576169 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.13105413105413105 - nodes in this community are weakly interconnected._