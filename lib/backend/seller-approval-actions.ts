"use server";

/**
 * Admin-only seller approval actions.
 * Core logic in lib/services/seller-approvals.ts: not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";
import {
  approveSellerApplicationCore,
  rejectSellerApplicationCore,
} from "@/lib/services/seller-approvals";
import { getLoggedInUser } from "@/lib/backend/session";
import {
  assertAdminMutationRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/security/rate-limit";

export type SellerApprovalActionState = {
  success?: string;
  error?: string;
};

async function assertAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!(await assertAdminMutationRateLimit(user.$id)).ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }
  return { ok: true, userId: user.$id };
}

function revalidateSellerPaths(): void {
  revalidatePath("/admin/sellers");
  revalidatePath("/admin", "layout");
}

export async function approveSellerApplication(
  _prev: SellerApprovalActionState,
  formData: FormData,
): Promise<SellerApprovalActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const sellerProfileId = formData.get("sellerProfileId");
  if (typeof sellerProfileId !== "string" || !sellerProfileId.trim()) {
    return { error: "Missing seller application." };
  }

  const result = await approveSellerApplicationCore(
    auth.userId,
    sellerProfileId.trim(),
  );

  if (!result.ok) return { error: result.error };

  revalidateSellerPaths();
  return { success: result.message };
}

export async function rejectSellerApplication(
  _prev: SellerApprovalActionState,
  formData: FormData,
): Promise<SellerApprovalActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const sellerProfileId = formData.get("sellerProfileId");
  if (typeof sellerProfileId !== "string" || !sellerProfileId.trim()) {
    return { error: "Missing seller application." };
  }

  const reasonRaw = formData.get("reason");
  const reason =
    typeof reasonRaw === "string" && reasonRaw.trim().length > 0
      ? reasonRaw.trim()
      : null;
  if (reason && reason.length > 500) {
    return { error: "Rejection message must be at most 500 characters." };
  }

  const result = await rejectSellerApplicationCore(
    auth.userId,
    sellerProfileId.trim(),
    reason,
  );

  if (!result.ok) return { error: result.error };

  revalidateSellerPaths();
  return { success: result.message };
}
