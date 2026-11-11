"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPurchaseRequest,
  markPurchaseRequestCancelled,
  markPurchaseRequestSold,
} from "./purchase-requests";
import {
  PURCHASE_REQUEST_ERROR_CODES,
  type PurchaseRequestActionState,
} from "./purchase-request-errors";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateRequestPaths(requestId: string) {
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/seller/requests");
  revalidatePath(`/seller/requests/${requestId}`);
  revalidatePath("/seller");
  revalidatePath("/admin/requests");
}

export async function createPurchaseRequestAction(
  _prev: PurchaseRequestActionState,
  formData: FormData,
): Promise<PurchaseRequestActionState> {
  const productId = readString(formData, "productId");
  const quantityRaw = readString(formData, "quantity");
  const quantity = Number(quantityRaw);

  const result = await createPurchaseRequest({ productId, quantity });
  if (!result.ok) {
    return { error: result.error, errorCode: result.errorCode };
  }

  revalidatePath(`/products/${productId}`);
  revalidateRequestPaths(result.requestId);
  redirect(`/requests/${result.requestId}`);
}

export async function markPurchaseRequestSoldAction(
  _prev: PurchaseRequestActionState,
  formData: FormData,
): Promise<PurchaseRequestActionState> {
  const requestId = readString(formData, "requestId");
  const result = await markPurchaseRequestSold(requestId);
  if (!result.ok) {
    return { error: result.error, errorCode: result.errorCode };
  }
  revalidateRequestPaths(requestId);
  revalidatePath("/seller/listings");
  return { success: "Marked as sold. Stock updated." };
}

export async function markPurchaseRequestCancelledAction(
  _prev: PurchaseRequestActionState,
  formData: FormData,
): Promise<PurchaseRequestActionState> {
  const requestId = readString(formData, "requestId");
  const result = await markPurchaseRequestCancelled(requestId);
  if (!result.ok) {
    return { error: result.error, errorCode: result.errorCode };
  }
  revalidateRequestPaths(requestId);
  return { success: "Request cancelled. Stock unchanged." };
}

export async function createPurchaseRequestFromProduct(
  productId: string,
  quantity: number,
): Promise<PurchaseRequestActionState> {
  const result = await createPurchaseRequest({ productId, quantity });
  if (!result.ok) {
    return { error: result.error, errorCode: result.errorCode };
  }
  revalidatePath(`/products/${productId}`);
  revalidateRequestPaths(result.requestId);
  return {
    success: "Request sent.",
    requestId: result.requestId,
    errorCode: undefined,
  };
}
