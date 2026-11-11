import { hasDatabaseConfig } from "@/lib/backend/config";
import { getLoggedInUser } from "@/lib/backend/session";
import { countPurchaseRequestsByStatus } from "./purchase-requests";

export type SellerMetrics = {
  openCount: number;
  soldCount: number;
  cancelledCount: number;
};

function emptyMetrics(): SellerMetrics {
  return {
    openCount: 0,
    soldCount: 0,
    cancelledCount: 0,
  };
}

/**
 * Read-only seller dashboard KPIs for purchase requests (session; own sellerId only).
 * Returns zeros on empty data or errors: never throws to callers.
 */
export async function getSellerMetrics(): Promise<SellerMetrics> {
  if (!hasDatabaseConfig()) return emptyMetrics();

  const user = await getLoggedInUser();
  if (!user) return emptyMetrics();

  try {
    const counts = await countPurchaseRequestsByStatus({ sellerId: user.$id });
    return {
      openCount: counts.requested,
      soldCount: counts.sold,
      cancelledCount: counts.cancelled,
    };
  } catch {
    return emptyMetrics();
  }
}
