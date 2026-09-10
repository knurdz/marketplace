import type { StatusTone } from "@/components/layout/status-pill";
import type { NotifyLogOutcome } from "@/lib/services/notify-log-redact";
import type {
  BankSlipStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ReportStatus,
  SellerStatus,
} from "@/lib/types";

export function orderStatusTone(status: OrderStatus): StatusTone {
  switch (status) {
    case "completed":
    case "paid":
      return "positive";
    case "processing":
    case "shipped":
    case "ready_pickup":
      return "info";
    case "pending_payment":
    case "payment_review":
      return "warning";
    case "cancelled":
    case "refunded":
      return "danger";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function paymentStatusTone(status: PaymentStatus): StatusTone {
  switch (status) {
    case "paid":
      return "positive";
    case "pending":
    case "awaiting_verification":
      return "warning";
    case "failed":
    case "refunded":
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
      return "danger";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function bankSlipStatusTone(status: BankSlipStatus): StatusTone {
  switch (status) {
    case "approved":
      return "positive";
    case "pending":
      return "warning";
    case "rejected":
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

export function notifyLogOutcomeTone(outcome: NotifyLogOutcome): StatusTone {
  switch (outcome) {
    case "settled":
      return "positive";
    case "already_paid":
    case "noop":
    case "refunded":
      return "info";
    case "ignored":
    case "unknown":
      return "warning";
    case "rejected":
    case "payment_failed":
    case "settle_failed":
    case "config_error":
    case "error":
      return "danger";
    default: {
      const exhaustive: never = outcome;
      return exhaustive;
    }
  }
}
