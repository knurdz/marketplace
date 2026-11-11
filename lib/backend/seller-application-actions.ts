"use server";

import { revalidatePath } from "next/cache";
import {
  submitSellerApplicationCore,
  updateOwnShopBannerCore,
  updateOwnShopPoliciesCore,
  updateOwnShopProfileCore,
  type SubmitSellerApplicationInput,
} from "@/lib/services/seller-application";
import { getLoggedInUser } from "@/lib/backend/session";
import {
  assertRateLimit,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import { verifyFormGuard } from "@/lib/security/bot-guard";

export type SellerApplicationActionState = {
  success?: string;
  error?: string;
};

export type ShopProfileActionState = {
  success?: string;
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateShopPaths(slug: string): void {
  revalidatePath("/seller/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/shop", "layout");
}

const FORM_GUARD_ERROR =
  "Could not submit this form. Please refresh and try again.";

async function checkSellerAccountRateLimit(): Promise<string | null> {
  const user = await getLoggedInUser();
  if (!user) return "You must be signed in.";
  const rate = await assertRateLimit({
    bucket: "account.seller",
    key: `user:${user.$id}`,
    ...RATE_LIMITS.accountMutations,
  });
  return rate.ok ? null : RATE_LIMIT_MESSAGE;
}

export async function submitSellerApplication(
  _prev: SellerApplicationActionState,
  formData: FormData,
): Promise<SellerApplicationActionState> {
  const guard = await verifyFormGuard(formData, "seller.application.submit");
  if (!guard.ok) return { error: FORM_GUARD_ERROR };

  const rateError = await checkSellerAccountRateLimit();
  if (rateError) return { error: rateError };

  const input: SubmitSellerApplicationInput = {
    shopName: readString(formData, "shopName"),
    slug: readString(formData, "slug") || undefined,
    bio: readString(formData, "bio") || undefined,
  };

  const result = await submitSellerApplicationCore(input);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/pending");
  revalidatePath("/seller");
  revalidatePath("/admin/sellers");
  return { success: result.message };
}

export async function updateOwnShopProfile(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
  const guard = await verifyFormGuard(formData, "seller.shop.profile.update");
  if (!guard.ok) return { error: FORM_GUARD_ERROR };

  const rateError = await checkSellerAccountRateLimit();
  if (rateError) return { error: rateError };

  const result = await updateOwnShopProfileCore({
    shopName: readString(formData, "shopName"),
    bio: readString(formData, "bio") || undefined,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateShopPaths(result.slug);
  return { success: result.message };
}

export async function updateOwnShopPolicies(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
  const guard = await verifyFormGuard(formData, "seller.shop.policies.update");
  if (!guard.ok) return { error: FORM_GUARD_ERROR };

  const rateError = await checkSellerAccountRateLimit();
  if (rateError) return { error: rateError };

  const result = await updateOwnShopPoliciesCore({
    returnPolicy: readString(formData, "returnPolicy"),
    shippingPolicy: readString(formData, "shippingPolicy"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/settings");
  revalidateShopPaths(result.slug);
  return { success: result.message };
}

export async function updateOwnShopBanner(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
  const guard = await verifyFormGuard(formData, "seller.shop.banner.update");
  if (!guard.ok) return { error: FORM_GUARD_ERROR };

  const rateError = await checkSellerAccountRateLimit();
  if (rateError) return { error: rateError };

  const file = formData.get("banner");
  if (!(file instanceof File)) {
    return { error: "Choose an image file to upload." };
  }

  const result = await updateOwnShopBannerCore(file);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateShopPaths(result.slug);
  return { success: result.message };
}
