"use server";

/**
 * Client-callable order mutations for storefront checkout.
 */

import { revalidatePath } from "next/cache";
import { isPaymentMethod } from "@/lib/types";
import { confirmFreeOrder } from "./free-order";
import {
  ORDER_ERROR_CODES,
  type CancelOrderActionState,
  type ConfirmFreeOrderActionState,
  type CreateOrderActionState,
  type PollPayHerePaymentStatusActionState,
  type ReorderActionState,
  type SubmitBankSlipActionState,
} from "./order-errors";
import {
  cancelOrder as cancelOrderImpl,
  checkoutContinuationPath,
  createOrder as createOrderImpl,
  getOwnOrder,
  getOwnPaymentForOrder,
  reorderOwnOrder,
  submitBankSlip as submitBankSlipImpl,
} from "./orders";

function revalidateCheckoutPaths() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/free");
  revalidatePath("/checkout/bank");
  revalidatePath("/checkout/payhere");
  revalidatePath("/checkout/payhere/return");
  revalidatePath("/checkout/payhere/cancel");
}

function revalidateOrderPaths(orderId?: string) {
  revalidatePath("/orders");
  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }
}

export async function createOrder(
  _prev: CreateOrderActionState,
  formData: FormData,
): Promise<CreateOrderActionState> {
  const paymentMethodRaw = formData.get("paymentMethod");
  const paymentMethod =
    typeof paymentMethodRaw === "string" && isPaymentMethod(paymentMethodRaw)
      ? paymentMethodRaw
      : null;

  if (!paymentMethod) {
    return {
      ok: false,
      error: "Choose a valid payment method.",
    };
  }

  const line2Raw = formData.get("line2");
  const couponRaw = formData.get("couponCode");
  const result = await createOrderImpl({
    line1: String(formData.get("line1") ?? ""),
    line2:
      typeof line2Raw === "string" && line2Raw.trim().length > 0
        ? line2Raw
        : undefined,
    city: String(formData.get("city") ?? ""),
    district: String(formData.get("district") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    paymentMethod,
    couponCode:
      typeof couponRaw === "string" && couponRaw.trim().length > 0
        ? couponRaw
        : undefined,
  });

  if (result.ok) {
    revalidateCheckoutPaths();
    return {
      ok: true,
      orderId: result.orderId,
      paymentMethod: result.paymentMethod,
    };
  }

  return {
    ok: false,
    error: result.error,
    code: result.code,
  };
}

export async function confirmFreeOrderAction(
  _prev: ConfirmFreeOrderActionState,
  formData: FormData,
): Promise<ConfirmFreeOrderActionState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { ok: false, error: "Invalid order id." };
  }

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "free") {
    return {
      ok: false,
      error: "Order not found.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "free") {
    return {
      ok: false,
      error: "Payment not found.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  const confirm = await confirmFreeOrder({ orderId });
  if (!confirm.ok) {
    const isNotConfigured = confirm.error.includes("not configured");
    const isNotFound = confirm.error === "Order not found.";
    return {
      ok: false,
      error: confirm.error,
      code: isNotConfigured
        ? ORDER_ERROR_CODES.CONFIRM_NOT_CONFIGURED
        : isNotFound
          ? ORDER_ERROR_CODES.NOT_FOUND
          : undefined,
    };
  }

  const refreshedOrder = await getOwnOrder(orderId);
  const refreshedPayment = await getOwnPaymentForOrder(orderId);

  if (refreshedPayment?.status === "paid" && refreshedOrder) {
    revalidateCheckoutPaths();
    revalidateOrderPaths(orderId);
    return {
      ok: true,
      orderStatus: refreshedOrder.status,
      paymentStatus: refreshedPayment.status,
    };
  }

  return {
    ok: false,
    pendingConfirmation: true,
    error:
      "Confirmation is processing. Refresh in a moment to see your order status.",
    orderStatus: refreshedOrder?.status ?? order.status,
    paymentStatus: refreshedPayment?.status ?? payment.status,
  };
}

export async function submitBankSlipAction(
  _prev: SubmitBankSlipActionState,
  formData: FormData,
): Promise<SubmitBankSlipActionState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { ok: false, error: "Invalid order id." };
  }

  const fileRaw = formData.get("slip");
  if (!(fileRaw instanceof File) || fileRaw.size === 0) {
    return {
      ok: false,
      error: "Choose a bank slip file to upload.",
    };
  }

  const result = await submitBankSlipImpl({ orderId, file: fileRaw });

  if (result.ok) {
    revalidateCheckoutPaths();
    return {
      ok: true,
      orderStatus: result.orderStatus,
      paymentStatus: result.paymentStatus,
    };
  }

  return {
    ok: false,
    error: result.error,
    code: result.code,
  };
}

/** Poll own order + payment for PayHere return/cancel pages (DB only — never trust redirect params). */
export async function pollPayHerePaymentStatusAction(
  orderId: string,
): Promise<PollPayHerePaymentStatusActionState> {
  const trimmed = orderId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Invalid order id." };
  }

  const order = await getOwnOrder(trimmed);
  if (!order || order.paymentMethod !== "payhere") {
    return {
      ok: false,
      error: "Order not found.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  const payment = await getOwnPaymentForOrder(trimmed);
  if (!payment || payment.method !== "payhere") {
    return {
      ok: false,
      error: "Payment not found.",
      code: ORDER_ERROR_CODES.NOT_FOUND,
    };
  }

  return {
    ok: true,
    orderStatus: order.status,
    paymentStatus: payment.status,
  };
}

export async function cancelOrderAction(
  _prev: CancelOrderActionState,
  formData: FormData,
): Promise<CancelOrderActionState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { ok: false, error: "Invalid order id." };
  }

  const result = await cancelOrderImpl(orderId);

  if (result.ok) {
    revalidateOrderPaths(orderId);
    revalidateCheckoutPaths();
    return {
      ok: true,
      orderStatus: result.orderStatus,
    };
  }

  return {
    ok: false,
    error: result.error,
    code: result.code,
  };
}

export async function reorderOrderAction(
  orderId: string,
): Promise<ReorderActionState> {
  const trimmed = orderId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Invalid order id." };
  }

  const result = await reorderOwnOrder(trimmed);

  if (result.ok) {
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { ok: true, message: result.message };
  }

  return {
    ok: false,
    error: result.error,
    code: result.code,
  };
}

export { checkoutContinuationPath };

export type {
  CancelOrderActionState,
  ConfirmFreeOrderActionState,
  CreateOrderActionState,
  PollPayHerePaymentStatusActionState,
  ReorderActionState,
  SubmitBankSlipActionState,
} from "./order-errors";
