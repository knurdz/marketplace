# Trust rules (Knurdz Marketplace)

Computed heuristics for **admin human review** — not automated enforcement. No account is auto-suspended by these rules; admins act via existing tools (`/admin/users`, `/admin/sellers`, `/admin/payments/bank-slips`).

**Implementation:** [`lib/trust/rules.ts`](../../lib/trust/rules.ts) (source of truth for thresholds)  
**Service:** [`lib/services/trust-signals.ts`](../../lib/services/trust-signals.ts)  
**UI:** [`app/admin/trust/page.tsx`](../../app/admin/trust/page.tsx)

## No persisted state

- There is **no** `verified`, `badge`, or `fraud_flags` column or collection in Appwrite.
- Badge eligibility and fraud flags are **computed on read** from existing data.
- This step is **read-only** — no admin toggle to grant, dismiss, or override signals.

Thresholds below are **reasonable defaults** for the team to tune in code, not gospel.

---

## Verified badge (computed eligibility)

A seller is **Verified-eligible** when **all** of the following are true:

| Criterion | Threshold |
|-----------|-----------|
| Seller status | `approved` |
| Account age | ≥ **14** days since `seller_profiles.$createdAt` |
| Completed orders | ≥ **3** orders with `orders.status === "completed"` |
| Open reports | **0** reports with `status` in `open` or `reviewing` against any of the seller's products |

When eligible, admins see the seller in **Verified-eligible sellers** on `/admin/trust` with human-readable reasons. The badge is **not** displayed on the storefront in this step.

---

## Fraud / risk flags

Each rule is independent. A seller may trigger multiple flags. Only triggered flags appear in the **Flagged sellers** list.

### `rejected_bank_slips`

**Triggers when:** ≥ **2** `bank_slips` with `status === "rejected"` in the last **30** days, attributed to the seller via `bank_slips.orderId` → `orders.sellerId`.

**Intent:** Repeated rejected payment proofs may indicate fraud or policy abuse.

### `new_seller_high_first_order`

**Triggers when:** Seller profile age ≤ **14** days **and** the seller's earliest order (by `$createdAt`) has `totalAmount` ≥ **50,000** LKR.

**Intent:** New accounts with unusually large first orders warrant review.

### `open_unresolved_reports`

**Triggers when:** ≥ **1** `reports` row with `status` in `open` or `reviewing` against a product belonging to the seller (`reports.productId` → `products.sellerId`).

**Intent:** Active community reports need triage before trust signals improve.

### `rapid_cancellation_rate`

**Triggers when:** In the last **30** days, the seller has ≥ **5** orders **and** the proportion with `orders.status === "cancelled"` is ≥ **50%**.

**Small-sample guard:** Sellers with fewer than **5** orders in the window are **not** flagged (e.g. 1 order and 1 cancellation does not fire this rule).

**Intent:** Sustained high cancellation rates may indicate fulfillment or trust issues.

---

## Data sources (read-only)

| Collection | Fields used |
|------------|-------------|
| `seller_profiles` | `userId`, `shopName`, `status`, `$createdAt` |
| `orders` | `sellerId`, `status`, `totalAmount`, `$createdAt` |
| `bank_slips` | `orderId`, `status`, `$createdAt` |
| `products` | `$id`, `sellerId` (join for reports) |
| `reports` | `productId`, `status` |

`payments` is **not** used for these rules; order totals and statuses are sufficient.

---

## List scan limits

`listSellersWithFlags()` and `listVerifiedSellers()` evaluate up to **100** most recently created **approved** sellers per request. Query pattern is bulk batched (sellers → orders → rejected slips in window → products → open reports), not N+1 per seller.

---

## Future: manual Verified override

A persisted admin-granted "Verified" badge independent of these rules would require a schema addition on `seller_profiles` (e.g. `verifiedOverride` boolean), coordinated with Member 1. Not implemented in step 4.12.
