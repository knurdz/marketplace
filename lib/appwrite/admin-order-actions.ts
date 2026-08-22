"use server";

/**
 * Admin-only order cancel / refund actions.
 * Core logic in lib/services/admin-order-overrides.ts.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  cancelAdminOrder,
  refundAdminOrder,
} from "@/lib/services/admin-order-overrides";

export type AdminOrderActionState = {
  success?: string;
  error?: string;
};

async function assertAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true };
}

function revalidateOrderPaths(orderId?: string): void {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }
}

export async function cancelAdminOrderFormAction(
  _prev: AdminOrderActionState,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !orderId.trim()) {
    return { error: "Missing order." };
  }

  const reason = formData.get("reason");
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "A reason is required." };
  }

  const result = await cancelAdminOrder(orderId.trim(), reason);
  if (!result.ok) return { error: result.error };

  revalidateOrderPaths(orderId.trim());
  return { success: result.message };
}

export async function refundAdminOrderFormAction(
  _prev: AdminOrderActionState,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !orderId.trim()) {
    return { error: "Missing order." };
  }

  const reason = formData.get("reason");
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "A reason is required." };
  }

  const result = await refundAdminOrder(orderId.trim(), reason);
  if (!result.ok) return { error: result.error };

  revalidateOrderPaths(orderId.trim());
  return { success: result.message };
}
