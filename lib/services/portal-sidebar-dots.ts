import { cache } from "react";
import { eq, inArray } from "drizzle-orm";
import { hasDatabaseConfig, getDb } from "@/lib/db/client";
import { products, reports, reviews } from "@/lib/db/schema";
import { logError } from "@/lib/observability/log-error";
import { PENDING_REVIEW_PRODUCT_STATUS } from "@/lib/types/status";
import { hasPendingSellerApplications } from "./seller-approvals";

export type AdminPortalSidebarDots = {
  listings: boolean;
  reviews: boolean;
  reports: boolean;
  sellers: boolean;
};

const EMPTY_DOTS: AdminPortalSidebarDots = {
  listings: false,
  reviews: false,
  reports: false,
  sellers: false,
};

/**
 * Actionable admin moderation queues for portal sidebar dots.
 * Cached per request; call only from admin-guarded layouts.
 */
export const getAdminPortalSidebarDots = cache(
  async function getAdminPortalSidebarDots(): Promise<AdminPortalSidebarDots> {
    if (!hasDatabaseConfig()) return EMPTY_DOTS;

    try {
      const db = getDb();
      const [
        pendingListing,
        pendingReview,
        triageReport,
        pendingSellers,
      ] = await Promise.all([
        db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.status, PENDING_REVIEW_PRODUCT_STATUS))
          .limit(1),
        db
          .select({ id: reviews.id })
          .from(reviews)
          .where(eq(reviews.status, "pending"))
          .limit(1),
        db
          .select({ id: reports.id })
          .from(reports)
          .where(inArray(reports.status, ["open", "reviewing"]))
          .limit(1),
        hasPendingSellerApplications(),
      ]);

      return {
        listings: pendingListing.length > 0,
        reviews: pendingReview.length > 0,
        reports: triageReport.length > 0,
        sellers: pendingSellers,
      };
    } catch (error) {
      logError("portalSidebarDots.admin", error);
      return EMPTY_DOTS;
    }
  },
);
