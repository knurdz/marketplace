import type { OrderStatus, PaymentMethod } from "@/lib/types";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  payment_review: "Payment review",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  ready_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  payhere: "PayHere",
  bank_transfer: "Bank transfer",
  free: "Free",
  cod: "Cash on delivery",
};

export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}
