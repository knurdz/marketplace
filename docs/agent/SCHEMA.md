# Knurdz Marketplace — Data SCHEMA

> **Storage:** MariaDB tables via Drizzle (`lib/db/schema.ts`).  
> TypeScript modules: [`lib/types/`](../../lib/types/).  
> Apply migrations with: `npm run db:migrate`

## Auth roles

| Role | Meaning |
|------|---------|
| `buyer` | Default shopper |
| `seller` | Approved seller |
| `admin` | Platform admin |

`user.is_super_admin` — at most one account may be `true`. That account manages other admins (`/admin/admins`). Other admins keep `admin` role with `is_super_admin = false`.

## Status enums (canonical)

| Domain | Values |
|--------|--------|
| Product `status` | `draft` \| `pending_review` \| `active` \| `rejected` \| `archived` |
| Purchase request `status` | `requested` \| `sold` \| `cancelled` |
| Seller profile `status` | `pending` \| `rejected` \| `approved` |
| Report `status` | `open` \| `reviewing` \| `resolved` \| `dismissed` |
| Review `status` | `pending` \| `approved` \| `rejected` |

## Contact-request contract

| Area | Rule |
|------|------|
| **Buy** | Signed-in buyer (not the seller) with a phone on `profiles` sends a request for quantity 1…stock. Seller must also have a phone. Create does **not** change stock. |
| **Contact** | Phone (`profiles.phone`) and email (`user.email`) are revealed only to the other party on that request (and admin). Not on public product/shop pages. Never log full contact details. |
| **Sold** | Seller-only, from `requested`. Transaction: if stock ≥ quantity, decrement stock and set status `sold`; otherwise fail. |
| **Cancelled** | Seller-only, from `requested`. Stock unchanged. |
| **Reviews** | Seller-only rating after a **sold** request (`requestId` unique). Starts `pending`; public shop shows `approved` only after admin approve. |
| **Storefront buyable** | `status=active` AND `available=true` AND `stock > 0`. |

## Core tables

### `profiles`

| Column | Notes |
|--------|-------|
| `userId` | Auth user id (unique) |
| `displayName` | Required |
| `phone` | Required before sending or receiving buy requests |
| `avatarFileId`, `bio` | Optional |
| `registrationComplete` | Email signup true; social finish via `/register/complete` |

### `seller_profiles`

Shop name, slug, bio, banner, status, return/shipping policies. **No bank account fields.**

### `products` / `product_images`

Unchanged listing model (`price`, `stock`, `available`, `status`, `featured`, …).

### `product_revisions`

| Column | Notes |
|--------|-------|
| `productId` | Unique — one staged edit per product |
| `patch` | JSON text: field overrides and optional full proposed `images` array when the gallery changed |

Used when sellers edit an **active** listing: the live row stays on the storefront until admin approves the revision.

### `wishlist_items`

Owner-only saved products.

### `purchase_requests`

| Column | Notes |
|--------|-------|
| `buyerId`, `sellerId`, `productId` | Parties + listing |
| `openKey` | Nullable unique `buyerId:productId`; present only while `requested`, preventing duplicate open requests |
| `title` | Snapshot |
| `quantity`, `unitPrice`, `currency` | Snapshot |
| `status` | `requested` \| `sold` \| `cancelled` |

### `reviews`

| Column | Notes |
|--------|-------|
| `requestId` | Unique — one review per sold request |
| `buyerId`, `sellerId` | Buyer rates the seller |
| `rating` | 1–5 (required) |
| `comment` | Optional |
| `status` | `pending` \| `approved` \| `rejected` |

### `categories`

| Column | Notes |
|--------|-------|
| `name`, `slug` | Display name + unique slug |
| `parentId` | Optional parent for nesting |
| `imageFileId` | Optional Hostinger `categories` bucket file id |

Storefront/admin lists rank categories by live product count (`status=active` and `available=true`), then name.

### Also retained

`reports`, `notifications`, `platform_settings`, `audit_logs`, `view_stats`,
`rate_limits`, `stored_files`, `storage_quotas`, Better Auth `user` / `session`
/ `account` / `verification` / `auth_rate_limit`.

`auth_rate_limit` is Better Auth's database-backed HTTP endpoint limiter. It is
separate from the marketplace `rate_limits` table so Better Auth can manage its
own key, count, and request-window state atomically.

`storage_quotas` is an atomic per-owner reservation counter (maximum 100 files
and 250MB). Uploads reserve before writing and release on failed upload or
deletion, preventing parallel requests from bypassing aggregate quotas.

## Removed

`carts`, `cart_items`, `orders`, `order_items`, `payments`, `bank_slips`, `coupons`, `coupon_redemptions`, `payhere_notify_logs`, `threads`, `messages`, and seller bank columns.

Migration: [`drizzle/0003_contact_requests.sql`](../../drizzle/0003_contact_requests.sql).
