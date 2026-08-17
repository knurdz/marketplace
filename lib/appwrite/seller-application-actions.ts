"use server";

import { revalidatePath } from "next/cache";
import {
  submitSellerApplicationCore,
  updateOwnBankDetailsCore,
  updateOwnShopBannerCore,
  updateOwnShopPoliciesCore,
  updateOwnShopProfileCore,
  type SubmitSellerApplicationInput,
} from "@/lib/services/seller-application";

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

export async function submitSellerApplication(
  _prev: SellerApplicationActionState,
  formData: FormData,
): Promise<SellerApplicationActionState> {
  const input: SubmitSellerApplicationInput = {
    shopName: readString(formData, "shopName"),
    slug: readString(formData, "slug") || undefined,
    bio: readString(formData, "bio") || undefined,
  };

  const result = await submitSellerApplicationCore(input);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/become-seller");
  revalidatePath("/seller");
  revalidatePath("/admin/sellers");
  return { success: result.message };
}

export async function updateOwnShopProfile(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
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

export async function updateOwnBankDetails(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
  const result = await updateOwnBankDetailsCore({
    bankName: readString(formData, "bankName"),
    bankAccountName: readString(formData, "bankAccountName"),
    bankAccountNumber: readString(formData, "bankAccountNumber"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/shop");
  return { success: result.message };
}

export async function updateOwnShopPolicies(
  _prev: ShopProfileActionState,
  formData: FormData,
): Promise<ShopProfileActionState> {
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
