# Graph Report - .  (2026-08-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 529 nodes · 845 edges · 40 communities (28 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19e79bda`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- config.ts
- setup-mvp-schema.mjs
- rate-limit.ts
- devDependencies
- compilerOptions
- dependencies
- status.ts
- profiles.ts
- components.json
- cn
- seed-demo.mjs
- models.ts
- portal-shell.tsx
- products.ts
- storage.ts
- notifications.ts
- error-fallback.tsx
- page-loader.tsx
- legal-page.tsx
- setup-storage-buckets.mjs
- layout.tsx
- page.tsx
- page.tsx
- roles.ts
- page.tsx
- page.tsx
- layout.tsx
- keys.ts
- page.tsx
- badge.tsx
- shadcn
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `cn()` - 16 edges
3. `waitColumnsAvailable()` - 16 edges
4. `ensureString()` - 16 edges
5. `ensureTable()` - 15 edges
6. `ensureIndex()` - 15 edges
7. `main()` - 15 edges
8. `assertRateLimit()` - 11 edges
9. `setupProducts()` - 10 edges
10. `isOneOf()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `ResendVerificationForm()` --indirect_call--> `requestEmailVerification()`  [INFERRED]
  components/auth/resend-verification-form.tsx → lib/appwrite/recovery.ts
- `Input()` --calls--> `cn()`  [EXTRACTED]
  components/ui/input.tsx → lib/utils.ts
- `Label()` --calls--> `cn()`  [EXTRACTED]
  components/ui/label.tsx → lib/utils.ts
- `Separator()` --calls--> `cn()`  [EXTRACTED]
  components/ui/separator.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (40 total, 12 thin omitted)

### Community 0 - "config.ts"
Cohesion: 0.11
Nodes (33): getBrowserAccount(), getBrowserClient(), ALL_BUCKET_IDS, ALL_TABLE_IDS, BANK_SLIP_EXTENSIONS, BANK_SLIP_MIME_TYPES, getAppUrl(), getAppwriteEndpoint() (+25 more)

### Community 1 - "setup-mvp-schema.mjs"
Cohesion: 0.19
Nodes (37): apiKey, client, db, endpoint, ensureBool(), ensureEnum(), ensureFloat(), ensureIndex() (+29 more)

### Community 2 - "rate-limit.ts"
Cohesion: 0.13
Nodes (30): initialState, ResendVerificationForm(), AuthActionState, mapAuthError(), readString(), rollbackSignup(), safeNextPath(), setSessionCookie() (+22 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, eslint-config-prettier, devDependencies, eslint, eslint-config-next, eslint-config-prettier, prettier (+24 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (29): appwrite, class-variance-authority, clsx, lucide-react, next, node-appwrite, devDependencies, shadcn (+21 more)

### Community 6 - "status.ts"
Cohesion: 0.10
Nodes (23): BANK_SLIP_STATUSES, BankSlipStatus, isBankSlipStatus(), isOneOf(), isOrderStatus(), isPaymentMethod(), isPaymentStatus(), isProductStatus() (+15 more)

### Community 7 - "profiles.ts"
Cohesion: 0.14
Nodes (18): AccountPage(), avatarInitial, initialState, ProfileForm(), useActionToasts(), asProfile(), createProfileForUser(), defaultDisplayName() (+10 more)

### Community 8 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "cn"
Cohesion: 0.17
Nodes (12): Button(), buttonVariants, Input(), Label(), Separator(), SheetContent(), SheetDescription(), SheetFooter() (+4 more)

### Community 10 - "seed-demo.mjs"
Cohesion: 0.18
Nodes (20): apiKey, CATEGORIES, client, db, DEMO_USERS, endpoint, ensureBuyerWelcomeNotification(), ensureCategory() (+12 more)

### Community 11 - "models.ts"
Cohesion: 0.14
Nodes (17): asNullableString(), asPlatformSetting(), getPlatformSetting(), getPlatformSettings(), normalizePlatformSettingKey(), withSessionTables(), BankSlip, Category (+9 more)

### Community 12 - "portal-shell.tsx"
Cohesion: 0.13
Nodes (8): ADMIN_NAV, SELLER_NAV, PortalNavItem, PortalShell(), PortalShellProps, StoreNavbarProps, formatRelative(), NotificationBell()

### Community 13 - "products.ts"
Cohesion: 0.23
Nodes (13): Home(), SearchPage(), SearchPageProps, asBoolean(), asNullableString(), asNumber(), asProduct(), getProduct() (+5 more)

### Community 14 - "storage.ts"
Cohesion: 0.23
Nodes (14): bankSlipPermissions(), deleteFile(), deleteFileAsAdmin(), extensionOf(), publicImagePermissions(), toInputFile(), uploadAvatar(), uploadBankSlip() (+6 more)

### Community 15 - "notifications.ts"
Cohesion: 0.41
Nodes (11): asNotification(), asNullableString(), countOwnUnread(), createNotificationForUser(), getOwnNotificationFeed(), listOwnNotifications(), markAllOwnNotificationsRead(), markOwnNotificationRead() (+3 more)

### Community 18 - "legal-page.tsx"
Cohesion: 0.33
Nodes (3): LegalPage(), LegalPageProps, LegalSection()

### Community 19 - "setup-storage-buckets.mjs"
Cohesion: 0.24
Nodes (9): apiKey, bucketCreatePerms, BUCKETS, client, endpoint, ensureBucket(), main(), projectId (+1 more)

### Community 21 - "layout.tsx"
Cohesion: 0.33
Nodes (4): jetbrainsMono, metadata, spaceGrotesk, Toaster()

### Community 22 - "page.tsx"
Cohesion: 0.47
Nodes (4): LoginPage(), safeNextPath(), initialState, LoginForm()

### Community 23 - "page.tsx"
Cohesion: 0.40
Nodes (3): SearchParams, initialState, ResetPasswordForm()

### Community 24 - "roles.ts"
Cohesion: 0.47
Nodes (5): requireLabel(), requireUser(), ROLE_LABELS, RoleLabel, userHasLabel()

### Community 28 - "keys.ts"
Cohesion: 0.50
Nodes (3): ALL_PLATFORM_SETTING_KEYS, PLATFORM_SETTING_KEYS, PlatformSettingKey

## Knowledge Gaps
- **171 isolated node(s):** `npx`, `eslintConfig`, `nextConfig`, `config`, `target` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Notification` connect `models.ts` to `notifications.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `npx`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `config.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11382113821138211 - nodes in this community are weakly interconnected._
- **Should `rate-limit.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._