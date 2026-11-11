# Trust rules (Knurdz Marketplace)

Computed heuristics for **admin human review** — not automated enforcement. No account is auto-suspended by these rules; admins act via existing tools (`/admin/sellers`, `/admin/buyers`, `/admin/reports`).

**Implementation:** [`lib/trust/rules.ts`](../../lib/trust/rules.ts) (source of truth for thresholds)  
**Service:** [`lib/services/trust-signals.ts`](../../lib/services/trust-signals.ts)  
**UI:** [`app/admin/trust/page.tsx`](../../app/admin/trust/page.tsx)

## No persisted state

- There is **no** `verified`, `badge`, or `fraud_flags` column or collection.
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
| Completed sales | ≥ **3** purchase requests with `status === "sold"` |
| Open reports | **0** reports with `status` in `open` or `reviewing` against any of the seller's products |

When eligible, admins see the seller in **Verified-eligible sellers** on `/admin/trust` with the criteria that passed. When not eligible, failures are used only internally for computation; the Verified list shows eligible sellers only. The badge is **not** displayed on the storefront in this step.

---

## Fraud / risk flags

Each rule is independent. A seller may trigger multiple flags. Only triggered flags appear in the **Flagged sellers** list.

### `new_seller_high_first_order`

**Triggers when:** Seller profile age ≤ **14** days **and** the seller's earliest sold request (by `$createdAt`) has `unitPrice * quantity` ≥ **50,000** LKR.

**Intent:** New accounts with unusually large first sales warrant review.

### `open_unresolved_reports`

**Triggers when:** ≥ **1** `reports` row with `status` in `open` or `reviewing` against a product belonging to the seller (`reports.productId` → `products.sellerId`).

**Intent:** Active community reports need triage before trust signals improve.

### `rapid_cancellation_rate`

**Triggers when:** In the last **30** days, the seller has ≥ **5** purchase requests **and** the proportion with `status === "cancelled"` is ≥ **50%**.

**Small-sample guard:** Sellers with fewer than **5** requests in the window are **not** flagged (e.g. 1 request and 1 cancellation does not fire this rule).

**Intent:** Sustained high cancellation rates may indicate fulfillment or trust issues.

### `rejected_bank_slips` (retired)

Bank slips are not used on this marketplace. The rule remains in code as a no-op so older callers stay stable; it never triggers.

---

## Data sources (read-only)

| Collection | Fields used |
|------------|-------------|
| `seller_profiles` | `userId`, `shopName`, `status`, `$createdAt` |
| `purchase_requests` | `sellerId`, `status`, `unitPrice`, `quantity`, `$createdAt` (sold → completed, cancelled → cancelled) |
| `products` | `$id`, `sellerId` (join for reports) |
| `reports` | `productId`, `status` |

---

## List scan limits

`listSellersWithFlags()` and `listVerifiedSellers()` evaluate up to **100** most recently created **approved** sellers per request. Query pattern is bulk batched (sellers → purchase requests → products → open reports), not N+1 per seller.

---

## Future: manual Verified override

A persisted admin-granted "Verified" badge independent of these rules would require a schema addition on `seller_profiles` (e.g. `verifiedOverride` boolean), coordinated with Member 1. Not implemented in step 4.12.
