"use server";

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  createCouponAdmin,
  setCouponActiveAdmin,
  type CreateCouponInput,
} from "@/lib/services/coupons";
import { isCouponType } from "@/lib/types/coupon";

export type CouponActionState = {
  success?: string;
  error?: string;
};

async function assertAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (!userHasLabel(user, ROLE_LABELS.admin)) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: user.$id };
}

function revalidateCouponPaths() {
  revalidatePath("/admin/coupons");
}

export async function createCouponFormAction(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const typeRaw = String(formData.get("type") ?? "");
  if (!isCouponType(typeRaw)) {
    return { error: "Invalid coupon type." };
  }

  const value = Number(String(formData.get("value") ?? ""));
  const maxRedemptions = Number(
    String(formData.get("maxRedemptions") ?? "0"),
  );
  const minOrderAmount = Number(
    String(formData.get("minOrderAmount") ?? "0"),
  );
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  let expiresAt: string | null = null;
  if (expiresAtRaw) {
    const parsed = Date.parse(expiresAtRaw);
    if (!Number.isFinite(parsed)) {
      return { error: "Invalid expiry date." };
    }
    expiresAt = new Date(parsed).toISOString();
  }

  const input: CreateCouponInput = {
    code: String(formData.get("code") ?? ""),
    type: typeRaw,
    value,
    maxRedemptions: Number.isFinite(maxRedemptions) ? maxRedemptions : 0,
    minOrderAmount: Number.isFinite(minOrderAmount) ? minOrderAmount : 0,
    expiresAt,
  };

  const result = await createCouponAdmin(auth.userId, input);
  if (!result.ok) return { error: result.error };

  revalidateCouponPaths();
  return { success: result.message };
}

export async function setCouponActiveFormAction(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const couponId = String(formData.get("couponId") ?? "").trim();
  const active = formData.get("active") === "true";

  if (!couponId) return { error: "Missing coupon." };

  const result = await setCouponActiveAdmin(couponId, active);
  if (!result.ok) return { error: result.error };

  revalidateCouponPaths();
  return { success: result.message };
}
