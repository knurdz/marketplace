import { cache } from "react";
import { count, eq } from "drizzle-orm";
import { mayBrowsePublicCatalog } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getDb, hasDatabaseConfig } from "@/lib/db/client";
import { purchaseRequests, wishlistItems } from "@/lib/db/schema";
import { logError } from "@/lib/observability/log-error";
import { OPEN_PURCHASE_REQUEST_STATUS } from "@/lib/types";

/** Signed-in buyer totals for nav badges. Sellers and admins get zeros. */
export type BuyerCommerceCounts = {
  wishlist: number;
  /** All of this buyer's purchase requests. */
  requests: number;
  /** Status `requested` — still waiting on the seller. */
  pendingRequests: number;
  soldRequests: number;
  cancelledRequests: number;
};

const EMPTY_COUNTS: BuyerCommerceCounts = {
  wishlist: 0,
  requests: 0,
  pendingRequests: 0,
  soldRequests: 0,
  cancelledRequests: 0,
};

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Own wishlist size and purchase-request totals.
 * Cached per request so the navbar and account sidebar share one query pair.
 */
export const getOwnBuyerCommerceCounts = cache(
  async function getOwnBuyerCommerceCounts(): Promise<BuyerCommerceCounts> {
    if (!hasDatabaseConfig()) return EMPTY_COUNTS;

    const user = await getLoggedInUser();
    if (!user || mayBrowsePublicCatalog(user)) return EMPTY_COUNTS;

    try {
      const db = getDb();
      const [wishlistRows, requestRows] = await Promise.all([
        db
          .select({ value: count() })
          .from(wishlistItems)
          .where(eq(wishlistItems.userId, user.$id)),
        db
          .select({
            status: purchaseRequests.status,
            value: count(),
          })
          .from(purchaseRequests)
          .where(eq(purchaseRequests.buyerId, user.$id))
          .groupBy(purchaseRequests.status),
      ]);

      const counts: BuyerCommerceCounts = { ...EMPTY_COUNTS };
      counts.wishlist = asCount(wishlistRows[0]?.value);

      for (const row of requestRows) {
        const n = asCount(row.value);
        counts.requests += n;
        if (row.status === OPEN_PURCHASE_REQUEST_STATUS) {
          counts.pendingRequests += n;
        } else if (row.status === "sold") {
          counts.soldRequests += n;
        } else if (row.status === "cancelled") {
          counts.cancelledRequests += n;
        }
      }

      return counts;
    } catch (error) {
      logError("buyerCommerce.counts", error);
      return EMPTY_COUNTS;
    }
  },
);
