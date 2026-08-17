"use server";

import { revalidatePath } from "next/cache";
import { fulfillSellerOrder } from "@/lib/services/seller-orders";
import { isOrderStatus, type OrderStatus } from "@/lib/types";

export type SellerFulfillmentActionState = {
  success?: string;
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateFulfillmentPaths(orderId: string): void {
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath("/seller");
  revalidatePath(`/orders/${orderId}`);
}

const STATUS_SUCCESS: Partial<Record<OrderStatus, string>> = {
  processing: "Order marked as processing.",
  shipped: "Order marked as shipped.",
  ready_pickup: "Order marked ready for pickup.",
  completed: "Order marked as completed.",
};

export async function updateSellerOrderStatus(
  _prev: SellerFulfillmentActionState,
  formData: FormData,
): Promise<SellerFulfillmentActionState> {
  const orderId = readString(formData, "orderId");
  const nextRaw = readString(formData, "nextStatus");
  const nextStatus = isOrderStatus(nextRaw) ? nextRaw : null;

  if (!orderId || !nextStatus) {
    return { error: "Invalid request." };
  }

  const result = await fulfillSellerOrder(orderId, nextStatus);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateFulfillmentPaths(orderId);
  return {
    success: STATUS_SUCCESS[nextStatus] ?? "Order status updated.",
  };
}
