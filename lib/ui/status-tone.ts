import type { StatusTone } from "@/components/layout/status-pill";
import type {
  ProductStatus,
  PurchaseRequestStatus,
  ReportStatus,
  SellerStatus,
} from "@/lib/types";

export function purchaseRequestStatusTone(
  status: PurchaseRequestStatus,
): StatusTone {
  switch (status) {
    case "sold":
      return "positive";
    case "requested":
      return "warning";
    case "cancelled":
      return "danger";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function productStatusTone(status: ProductStatus): StatusTone {
  switch (status) {
    case "active":
      return "positive";
    case "pending_review":
      return "warning";
    case "rejected":
      return "danger";
    case "draft":
    case "archived":
      return "neutral";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function sellerStatusTone(status: SellerStatus): StatusTone {
  switch (status) {
    case "approved":
      return "positive";
    case "pending":
      return "warning";
    case "rejected":
    case "banned":
      return "danger";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function reportStatusTone(status: ReportStatus): StatusTone {
  switch (status) {
    case "resolved":
      return "positive";
    case "open":
      return "warning";
    case "reviewing":
      return "info";
    case "dismissed":
      return "neutral";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
