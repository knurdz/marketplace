import type { PurchaseRequestStatus } from "@/lib/types";

const REQUEST_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  requested: "Requested",
  sold: "Sold",
  cancelled: "Cancelled",
};

export function formatPurchaseRequestStatus(
  status: PurchaseRequestStatus,
): string {
  return REQUEST_STATUS_LABELS[status];
}
