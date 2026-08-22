# Knurdz Marketplace — Appwrite SCHEMA (frozen)

> Created in Member 1 **step 1.7**. Field names and enum strings are the contract for Members 2–4.  
> Do not invent parallel status strings. TypeScript modules: [`lib/types/`](../../lib/types/) (step **1.10**).  
> Re-apply / verify with: `node --env-file=.env.local scripts/setup-mvp-schema.mjs`

## Connection

| Item | Value |
|------|--------|
| Project | Knurdz Marketplace |
| Region endpoint (example) | `https://sgp.cloud.appwrite.io/v1` |
| TablesDB database id | `marketplace` |
| Code constants | [`lib/appwrite/config.ts`](../../lib/appwrite/config.ts) |
| Status / types | [`lib/types/`](../../lib/types/) |

## Auth roles (labels)

Appwrite Auth **labels** (not Teams for MVP):

| Label | Meaning | Assigned by |
|-------|---------|-------------|
| `buyer` | Shopper | Register as Buyer (`Users.updateLabels`) |
| `seller` | Approved seller | Admin approval (not merged with `buyer`) |
| `admin` | Platform admin | Appwrite console / seed |

Permission helper: `Role.label('admin')`, etc. Server helpers: [`lib/appwrite/roles.ts`](../../lib/appwrite/roles.ts).

Route guards: [`proxy.ts`](../../proxy.ts) (cookie) + `app/seller/layout.tsx` / `app/admin/layout.tsx` (`requireLabel`).

### Abuse guards (step 1.14)

Server-action rate limits live in [`lib/security/rate-limit.ts`](../../lib/security/rate-limit.ts) (in-process sliding window). Wired on login, register, password recovery, email verify, and uploads via [`lib/appwrite/storage.ts`](../../lib/appwrite/storage.ts) `uploadFile`. **Single-instance only** — multi-instance hosts need a shared store later.

## Status / method enums (canonical)

| Domain | Values |
|--------|--------|
| Product `status` | `draft` \| `pending_review` \| `active` \| `rejected` \| `archived` |
| Order `status` | `pending_payment` \| `payment_review` \| `paid` \| `processing` \| `shipped` \| `ready_pickup` \| `completed` \| `cancelled` \| `refunded` |
| Payment `method` | `payhere` \| `bank_transfer` \| `free` \| `cod` |
| Payment `status` | `pending` \| `awaiting_verification` \| `paid` \| `failed` \| `refunded` |
| Seller profile `status` | `pending` \| `rejected` \| `approved` |
| Bank slip `status` | `pending` \| `approved` \| `rejected` |
| Report `status` | `open` \| `reviewing` \| `resolved` \| `dismissed` |

## MVP contract freeze (step 6.16)

Cross-member rules enforced in services — do not fork status strings or parallel policies.

| Area | Rule |
|------|------|
| **Publish** | Seller create → `draft`; submit for review → `pending_review` only; **sellers never write `active`**; admin approve → `active`. |
| **Live edits** | `updateOwnProductCore` may change title/price/stock/available on non-`archived` rows without forcing re-review (current behavior). |
| **Stock** | Decremented at **order placement** (`createOrder` transaction). Restore on buyer cancel, admin cancel, admin refund, PayHere chargeback, and bank-slip **reject-and-cancel**. Settlement paths (free confirm, bank approve, PayHere notify, COD accept) do **not** decrement again. Slip reject-with-retry does **not** restore stock. |
| **COD** | Buyer accept moves the order to `processing` and leaves payment `pending`. Seller “Mark delivered & cash collected” (`completed`) sets payment `paid` in the same transaction. |
| **Bank slips** | Reject (retry) returns payment to `pending` and order to `pending_payment` (slip stays `rejected`). Reject-and-cancel closes the order, marks payment `failed`, and restores stock. |
| **Bank details** | Public shop omits account numbers (`PublicSellerInfo` in `lib/services/sellers.ts`). Full number on owned bank checkout + owner profile only. Admin seller queue shows masked last-4. |
| **Storefront buyable** | `status=active` AND `available=true` AND `stock > 0` (`isProductPurchasable`). |
| **Idempotency keys** | `free:<orderId>`, `bank:<orderId>`, `cod:<orderId>`, `payhere:<payment_id>` on first successful settle. |

## Tables (24)

### `profiles`

- **Row security:** yes  
- **Table permissions:** none (create via admin on register only)  
- **Identity:** `rowId === userId` (Auth `$id`)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `userId` | string(36) | yes | Unique index |
| `displayName` | string(128) | yes | |
| `avatarFileId` | string(64) | no | Storage in 1.8 |
| `phone` | string(32) | no | |
| `bio` | string(1000) | no | |

**Indexes:** `userId_unique` (unique: `userId`)  
**Row permissions on create:** `read`/`update` → `Role.user(userId)`

---

### `seller_profiles`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read/update/delete(label:admin)`

| Column | Type | Required |
|--------|------|----------|
| `userId` | string(36) | yes |
| `shopName` | string(128) | yes |
| `slug` | string(128) | yes |
| `bio` | string(2000) | no |
| `bannerFileId` | string(64) | no |
| `status` | enum (seller) | yes |
| `bankAccountName` | string(128) | no |
| `bankAccountNumber` | string(64) | no |
| `bankName` | string(128) | no |
| `rejectionReason` | string(500) | no |
| `returnPolicy` | string(2000) | no |
| `shippingPolicy` | string(2000) | no |

**Indexes:** `userId_unique`, `slug_unique`, `status_idx`  
**Intent:** applicant owns row after create; public shop reads only when `approved` (enforce in app / tighter perms later). Never log full bank numbers. Policy text is public on approved shop/product pages when set.

---

### `categories`

- **Row security:** no  
- **Table permissions:** `read(any)`; `create/update/delete(label:admin)`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `name` | string(128) | yes | |
| `slug` | string(128) | yes | Unique |
| `parentId` | string(36) | no | Nested categories |
| `sortOrder` | integer | no | default `0` |

**Indexes:** `slug_unique`, `parentId_idx`

---

### `products`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read(any)` (storefront filters to `status=active` in app)

| Column | Type | Required |
|--------|------|----------|
| `sellerId` | string(36) | yes (Auth user id of seller) |
| `categoryId` | string(36) | yes |
| `title` | string(200) | yes |
| `description` | string(10000) | yes |
| `price` | float | yes (≥0) |
| `isFree` | boolean | yes |
| `status` | enum (product) | yes |
| `stock` | integer | yes (≥0) |
| `available` | boolean | yes |
| `currency` | string(8) | yes (e.g. `LKR`) |
| `featured` | boolean | yes | default `false`; admin-only toggle on `active` listings (step 6.20) |

**Indexes:** `sellerId_idx`, `categoryId_idx`, `status_idx`, `status_category_idx`, `price_idx`, `title_fulltext` (fulltext on `title` for `searchActiveProducts`, step 1.16), `featured_idx` (`featured`, `status`)  
**Row permissions:** seller owner `read/update/delete`; public reads rely on table `read(any)` + app filter.

---

### `product_images`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read(any)`

| Column | Type | Required |
|--------|------|----------|
| `productId` | string(36) | yes |
| `fileId` | string(64) | yes |
| `sortOrder` | integer | yes (≥0) |
| `alt` | string(200) | no |

**Indexes:** `productId_idx`

---

### `carts`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `userId` | string(36) | yes | Unique (one cart / user) |
| `sellerId` | string(36) | no | Single-seller cart hint |

**Indexes:** `userId_unique`  
**Intent:** owner-only via row permissions.

---

### `cart_items`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required |
|--------|------|----------|
| `cartId` | string(36) | yes |
| `productId` | string(36) | yes |
| `quantity` | integer | yes (≥1) |
| `unitPrice` | float | yes (≥0, snapshot) |

**Indexes:** `cartId_idx`, `cart_product_unique` (unique: `cartId`,`productId`)

---

### `wishlist_items`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `userId` | string(36) | yes | Auth `$id` of owner |
| `productId` | string(36) | yes | Saved product row id |

**Indexes:** `userId_idx`, `user_product_unique` (unique: `userId`,`productId`); `productId_idx`  
**Row permissions on create:** `read`/`update`/`delete` → `Role.user(userId)`; admin read/update/delete  
**Intent:** owner-only saved products; IDOR checks in services. Timestamps use system `$createdAt` / `$updatedAt`.

---

### `orders`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required |
|--------|------|----------|
| `buyerId` | string(36) | yes |
| `sellerId` | string(36) | yes |
| `status` | enum (order) | yes |
| `totalAmount` | float | yes (≥0) |
| `currency` | string(8) | yes |
| `shippingAddress` | string(2000) | yes |
| `paymentMethod` | enum (payment method) | yes |
| `couponCode` | string(32) | no | Applied code snapshot (step 6.20) |
| `discountAmount` | float | no | default `0`; pre-tax line discount |

**Indexes:** `buyerId_idx`, `sellerId_idx`, `status_idx`  
**Intent:** buyer + seller (+ admin) access via row permissions; IDOR checks in services. `couponCode` / `discountAmount` are written on every order (null / `0` when unused).

**COD:** `paymentMethod=cod` → buyer accept sets order `processing` with payment still `pending`. Seller completion marks payment `paid`.

---

### `order_items`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required |
|--------|------|----------|
| `orderId` | string(36) | yes |
| `productId` | string(36) | yes |
| `title` | string(200) | yes (snapshot) |
| `quantity` | integer | yes (≥1) |
| `unitPrice` | float | yes |
| `lineTotal` | float | yes |

**Indexes:** `orderId_idx`

---

### `payments`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read(label:admin)`

| Column | Type | Required |
|--------|------|----------|
| `orderId` | string(36) | yes |
| `method` | enum (payment method) | yes |
| `status` | enum (payment status) | yes |
| `amount` | float | yes |
| `currency` | string(8) | yes |
| `payherePaymentId` | string(128) | no |
| `idempotencyKey` | string(128) | no |

**Indexes:** `orderId_idx`, `idempotencyKey_unique`  
**Intent:** PayHere notify / free / bank paid updates are server-side and idempotent (**Member 1** payment setup; bank *approve UI* is Member 4). Free confirm (step **1.24**) writes `status=paid` + `idempotencyKey=free:<orderId>` via admin SDK; bank-slip approve (step **6.14**) writes `status=paid` + `idempotencyKey=bank:<orderId>`; COD buyer accept writes `idempotencyKey=cod:<orderId>` and leaves `status=pending` until seller completion. Buyers must not be trusted to set `paid`.

---

### `bank_slips`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read/update(label:admin)`

| Column | Type | Required |
|--------|------|----------|
| `paymentId` | string(36) | yes |
| `orderId` | string(36) | yes |
| `fileId` | string(64) | yes (private bucket in 1.8) |
| `uploadedBy` | string(36) | yes |
| `status` | enum (slip) | yes |
| `reviewedBy` | string(36) | no |
| `reviewNote` | string(500) | no |

**Indexes:** `paymentId_idx`, `orderId_idx`  
**Review:** Approve settles payment/order to `paid`. Reject (retry) reopens payment `pending` + order `pending_payment`. Reject-and-cancel closes the order.

---

### `reviews`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read(any)`

| Column | Type | Required |
|--------|------|----------|
| `orderId` | string(36) | yes |
| `productId` | string(36) | yes |
| `buyerId` | string(36) | yes |
| `sellerId` | string(36) | yes |
| `productRating` | integer | yes (1–5) |
| `sellerRating` | integer | no (1–5) |
| `comment` | string(2000) | no |

**Indexes:** `productId_idx`, `order_buyer_product_unique` (unique: `orderId`,`buyerId`,`productId`)

---

### `reports`

- **Row security:** yes  
- **Table permissions:** `create(users)`; `read/update(label:admin)`

| Column | Type | Required |
|--------|------|----------|
| `reporterId` | string(36) | yes |
| `productId` | string(36) | yes |
| `reason` | string(200) | yes |
| `details` | string(2000) | no |
| `status` | enum (report) | yes |

**Indexes:** `status_idx`, `productId_idx`

---

### `notifications`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required |
|--------|------|----------|
| `userId` | string(36) | yes |
| `type` | string(64) | yes |
| `title` | string(200) | yes |
| `body` | string(2000) | yes |
| `read` | boolean | yes |
| `link` | string(500) | no |
| `meta` | string(4000) | no (JSON text) |

**Indexes:** `userId_idx`, `user_read_idx`

**App create path (step 1.15):** use [`createNotificationForUser`](../../lib/appwrite/notifications.ts) (admin SDK) with row ACL `read/update/delete(user)` + admin. Do not expose a buyer “create notification” form. Own-only list/unread/mark-read via session client; badge polls ~45s ([`notification-bell.tsx`](../../components/notifications/notification-bell.tsx)). `link` must be a same-origin relative path.

---

### `platform_settings`

- **Row security:** no  
- **Table permissions:** `read(users)`; `create/update/delete(label:admin)`

| Column | Type | Required |
|--------|------|----------|
| `key` | string(128) | yes |
| `value` | string(4000) | yes |
| `description` | string(500) | no |

**Indexes:** `key_unique`

**App read path (step 1.19):** [`getPlatformSetting`](../../lib/services/platform-settings.ts) / `getPlatformSettings` via session client (signed-in only — matches `read(users)`). Key constants: [`lib/platform-settings/keys.ts`](../../lib/platform-settings/keys.ts). Writes: admin SDK / seed only (no admin UI in 1.19). Do not store PayHere merchant secrets here.

---

### `audit_logs`

- **Row security:** no  
- **Table permissions:** none (admin SDK / Functions only)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `actorId` | string(36) | no | |
| `event` | string(128) | yes | Prefer `event` over reserved-looking `action` |
| `resourceType` | string(64) | yes | |
| `resourceId` | string(36) | no | |
| `meta` | string(4000) | no | |
| `ip` | string(64) | no | |

**Indexes:** `actorId_idx`, `resource_idx`

---

### `coupons`

- **Row security:** no  
- **Table permissions:** none (admin SDK only — step **6.20**)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `code` | string(32) | yes | Unique; stored uppercase |
| `type` | enum | yes | `percent` \| `fixed` |
| `value` | float | yes | Percent 0–100 or fixed LKR amount |
| `active` | boolean | yes | Admin deactivate instead of delete when redeemed |
| `maxRedemptions` | integer | yes | `0` = unlimited |
| `redemptionCount` | integer | yes | Incremented on successful checkout |
| `minOrderAmount` | float | yes | Pre-discount cart subtotal minimum |
| `expiresAt` | string(64) | no | ISO datetime |
| `createdBy` | string(36) | yes | Admin user id |

**Indexes:** `code_unique` (unique: `code`)

---

### `coupon_redemptions`

- **Row security:** no  
- **Table permissions:** none (admin SDK only)

| Column | Type | Required |
|--------|------|----------|
| `couponId` | string(36) | yes |
| `orderId` | string(36) | yes |
| `buyerId` | string(36) | yes |
| `discountAmount` | float | yes |

**Indexes:** `orderId_unique` (unique: `orderId`), `couponId_idx`, `coupon_buyer_unique` (unique: `couponId`,`buyerId`)

---

### `threads`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `buyerId` | string(36) | yes | Order buyer |
| `sellerId` | string(36) | yes | Order seller |
| `orderId` | string(36) | yes | Unique — one thread per order (step 6.21) |
| `lastMessageAt` | string(64) | no | ISO timestamp for inbox sort |

**Indexes:** `orderId_unique`, `buyerId_idx`, `sellerId_idx`  
**Intent:** buyer + seller (+ admin) read/update via row permissions; no pre-purchase shop chat.

---

### `messages`

- **Row security:** yes  
- **Table permissions:** `create(users)`

| Column | Type | Required |
|--------|------|----------|
| `threadId` | string(36) | yes |
| `senderId` | string(36) | yes |
| `body` | string(2000) | yes |

**Indexes:** `threadId_idx`  
**Intent:** participants read; sender may update/delete own row. Plain text only (MVP).

---

### `payhere_notify_logs`

- **Row security:** no  
- **Table permissions:** none (admin SDK / `payhere-notify` Function API key only)  
- **Step:** Member 1 **1.26** — persist sanitized PayHere notify outcomes for ops. Never store `md5sig`, merchant secret, or card/PAN fields.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `outcome` | string(32) | yes | `NOTIFY_LOG_OUTCOMES` in [`notify-log-redact.ts`](../../lib/services/notify-log-redact.ts) |
| `orderId` | string(36) | no | Posted `order_id` |
| `payherePaymentId` | string(64) | no | Posted `payment_id` (PayHere id, not a secret) |
| `statusCode` | string(8) | no | PayHere `status_code` |
| `reason` | string(64) | no | Ignore/reject reason (`bad_sig`, `amount_mismatch`, …) |
| `httpStatus` | integer | yes | Function HTTP status returned to PayHere |
| `sanitizedPayload` | string(2000) | no | JSON allowlist: merchant_id, order_id, payment_id, amount, currency, status_code, method, status_message, custom_1/2 |

**Indexes:** `outcome_idx`, `orderId_idx`

**App read path:** [`listNotifyLogs`](../../lib/services/notify-logs.ts) via admin SDK (`requireLabel("admin")`). Session clients cannot read this table.

### `view_stats`

- **Row security:** no  
- **Table permissions:** none (admin/server SDK only)  
- **Intent:** daily aggregate product/shop views for seller dashboards. **No buyer `userId`.** One increment per IP + target per UTC day.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `sellerId` | string(36) | yes | Listing owner Auth `$id` |
| `kind` | enum `product` \| `shop` | yes | |
| `targetId` | string(36) | yes | Product `$id` or seller `userId` for shop |
| `day` | string(10) | yes | `YYYY-MM-DD` UTC |
| `count` | integer | yes | min 0 |

**Indexes:** `seller_kind_target_day_unique` (unique), `sellerId_idx`  
**Writers:** [`recordMarketplaceView`](../../lib/services/view-stats.ts) on buyer/guest PDP and public shop pages.

### `rate_limits`

- **Row security:** no  
- **Table permissions:** none (admin SDK only)  
- **Intent:** durable fixed-window limiter for money paths (checkout, confirms, bank slip, cancel, reorder). Survives process restarts. Cheap read paths stay in-memory (`lib/security/rate-limit.ts`).

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `bucket` | string(64) | yes | Named limiter (e.g. `checkout`) |
| `limitKey` | string(256) | yes | User id + IP (or similar) |
| `windowStart` | integer | yes | Epoch ms of the current window |
| `count` | integer | yes | Hits in this window (min 0) |

**Indexes:** `bucket_key_unique` (unique: `bucket`,`limitKey`)  
**Writers:** [`assertDurableRateLimit`](../../lib/security/durable-rate-limit.ts)

## Storage (step 1.8)

Buckets created in console; re-apply with `node --env-file=.env.local scripts/setup-storage-buckets.mjs`.  
Code constants: `BUCKET_*` in [`lib/appwrite/config.ts`](../../lib/appwrite/config.ts).  
Upload helpers: [`lib/appwrite/storage.ts`](../../lib/appwrite/storage.ts).  
Uploads are rate-limited in `uploadFile` (see Abuse guards above).

**Permission model:** file security **on** for all buckets. Bucket-level grant is `create(users)` only. Per-file ACLs are set at upload:

| Bucket ID | Max size | Extensions | Encryption | File permissions at upload |
|-----------|----------|------------|------------|----------------------------|
| `avatars` | 2MB | jpg, jpeg, png, webp | off | `read(any)` + `update/delete(user)` |
| `product-images` | 5MB | jpg, jpeg, png, webp | off | `read(any)` + `update/delete(user)` |
| `bank-slips` | 5MB | jpg, jpeg, png, webp, pdf | on | **private** — `read/update/delete(user)` + `read/update/delete(label:admin)`; never `read(any)` |

`*FileId` columns (`profiles.avatarFileId`, `seller_profiles.bannerFileId`, `product_images.fileId`, `bank_slips.fileId`, etc.) store Storage file IDs in the matching bucket.

## Console match checklist

- [x] Database `marketplace` exists (TablesDB)
- [x] All 24 table ids present and enabled
- [x] Columns/indexes available (verified via SDK list)
- [x] Enum values match this document
- [x] Code constants in `lib/appwrite/config.ts` match table ids
- [x] Setup script: `scripts/setup-mvp-schema.mjs` (idempotent)
- [x] Buckets `avatars`, `product-images`, `bank-slips` exist with file security
- [x] Setup script: `scripts/setup-storage-buckets.mjs` (idempotent)

## Changelog

| Date | Change |
|------|--------|
| 2026-08-11 | Initial freeze (step 1.7) |
| 2026-08-11 | Storage buckets + helpers (step 1.8) |
| 2026-08-11 | TS status/types at `lib/types/` (step 1.10) |
| 2026-08-11 | Phase 0 complete — demo seed + done gate (steps 1.12–1.13) |
| 2026-08-11 | Auth/upload rate limits (step 1.14) |
| 2026-08-11 | Notifications service + badge (step 1.15) |
| 2026-08-11 | Product title fulltext + searchActiveProducts (step 1.16) |
| 2026-08-11 | Platform settings read helpers + seed keys (step 1.19) |
| 2026-08-11 | PayHere Function interface freeze — see PAYHERE.md (step 1.20) |
| 2026-08-14 | `payhere_notify_logs` table for sanitized notify ops rows (step 1.26) |
| 2026-08-15 | `seller_profiles.returnPolicy` + `shippingPolicy` optional strings (step 3.14) |
| 2026-08-19 | Phase 6.1–6.14 reused frozen columns — **no console migration** (step 6.15). Idempotency keys: `free:<orderId>`, `bank:<orderId>`, `payhere:<payment_id>`. `audit_logs.ip` reserved; writers omit it today. |
| 2026-08-19 | MVP contract freeze subsection (step 6.16) — publish, stock-on-confirm, bank exposure, buyable rules. |
| 2026-08-21 | Phase 6.20 — `products.featured`, `orders.couponCode`/`discountAmount`, tables `coupons` + `coupon_redemptions`. |
| 2026-08-22 | Exclusive buyer/seller/admin shells. Register chooses buyer or seller (pending shop). `view_stats` daily aggregates for seller dashboards. |
| 2026-08-22 | Payment hardening: stock at placement + restore on cancel/refund; COD accept leaves payment pending; bank-slip reject retry vs reject-and-cancel; `rate_limits` table; reviews unique `(orderId,buyerId,productId)`; coupon one-per-buyer. Drift check: `npm run schema:verify`. |
