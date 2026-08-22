import { createNotificationForUser } from "@/lib/appwrite/notifications";
import { logError } from "@/lib/observability/log-error";
import { formatOrderStatus } from "@/lib/order-display";
import type { OrderStatus } from "@/lib/types";

async function notifyUserSafe(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  try {
    await createNotificationForUser(params);
  } catch (error) {
    logError("notify.user", error, {
      type: params.type,
      userId: params.userId,
    });
  }
}

export async function notifyOrderPaid(params: {
  orderId: string;
  buyerId: string;
  sellerId: string;
}): Promise<void> {
  const { orderId, buyerId, sellerId } = params;
  await notifyUserSafe({
    userId: buyerId,
    type: "order.paid",
    title: "Payment confirmed",
    body: "Your payment was confirmed. The seller can now fulfill your order.",
    link: `/orders/${orderId}`,
  });
  await notifyUserSafe({
    userId: sellerId,
    type: "order.paid",
    title: "New paid order",
    body: "A buyer paid for an order. Start fulfillment when you are ready.",
    link: `/seller/orders/${orderId}`,
  });
}

export async function notifyCodAccepted(params: {
  orderId: string;
  buyerId: string;
  sellerId: string;
}): Promise<void> {
  const { orderId, buyerId, sellerId } = params;
  await notifyUserSafe({
    userId: buyerId,
    type: "order.cod_accepted",
    title: "Cash on delivery accepted",
    body: "Your COD order was accepted. Pay cash when it is delivered.",
    link: `/orders/${orderId}`,
  });
  await notifyUserSafe({
    userId: sellerId,
    type: "order.cod_accepted",
    title: "New cash on delivery order",
    body: "A buyer accepted a COD order. Fulfill it and collect cash on delivery.",
    link: `/seller/orders/${orderId}`,
  });
}

export async function notifyBankSlipUploaded(params: {
  orderId: string;
  sellerId: string;
}): Promise<void> {
  await notifyUserSafe({
    userId: params.sellerId,
    type: "payment.slip_uploaded",
    title: "Bank slip uploaded",
    body: "A buyer uploaded a bank transfer receipt. Review it to confirm payment.",
    link: `/seller/orders/${params.orderId}`,
  });
}

export async function notifyBankSlipRejected(params: {
  orderId: string;
  buyerId: string;
  cancelled: boolean;
}): Promise<void> {
  if (params.cancelled) {
    await notifyUserSafe({
      userId: params.buyerId,
      type: "order.cancelled",
      title: "Order cancelled",
      body: "Your bank slip was rejected and the order was cancelled.",
      link: `/orders/${params.orderId}`,
    });
    return;
  }

  await notifyUserSafe({
    userId: params.buyerId,
    type: "payment.slip_rejected",
    title: "Bank slip rejected",
    body: "Your bank slip was rejected. Upload a new slip to continue checkout.",
    link: `/checkout/bank?orderId=${encodeURIComponent(params.orderId)}`,
  });
}

export async function notifyFulfillmentHop(params: {
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
}): Promise<void> {
  const { orderId, buyerId, sellerId, status } = params;
  const label = formatOrderStatus(status);

  await notifyUserSafe({
    userId: buyerId,
    type: `order.${status}`,
    title: `Order ${label.toLowerCase()}`,
    body:
      status === "completed"
        ? "Your order is complete. Please leave a review."
        : `Your order is now ${label.toLowerCase()}.`,
    link: `/orders/${orderId}`,
  });

  if (status === "completed") {
    await notifyUserSafe({
      userId: sellerId,
      type: "order.completed",
      title: "Order completed",
      body: "An order was marked completed.",
      link: `/seller/orders/${orderId}`,
    });
  }
}

export async function notifyNewMessage(params: {
  recipientId: string;
  orderId: string;
  threadId: string;
  portal: "buyer" | "seller";
}): Promise<void> {
  const href =
    params.portal === "seller"
      ? `/seller/messages/${params.threadId}`
      : `/messages/${params.threadId}`;
  await notifyUserSafe({
    userId: params.recipientId,
    type: "message.new",
    title: "New message",
    body: "You have a new message on an order conversation.",
    link: href,
  });
}
