"use server";

/**
 * Client-callable order mutations for storefront checkout.
 */

import { revalidatePath } from "next/cache";
import { isPaymentMethod } from "@/lib/types";
import type { CreateOrderActionState } from "./order-errors";
import {
  checkoutContinuationPath,
  createOrder as createOrderImpl,
} from "./orders";

function revalidateCheckoutPaths() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/free");
  revalidatePath("/checkout/bank");
  revalidatePath("/checkout/payhere");
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

export { checkoutContinuationPath };

export type { CreateOrderActionState } from "./order-errors";
