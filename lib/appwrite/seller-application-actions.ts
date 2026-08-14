"use server";

import { revalidatePath } from "next/cache";
import {
  submitSellerApplicationCore,
  type SubmitSellerApplicationInput,
} from "@/lib/services/seller-application";

export type SellerApplicationActionState = {
  success?: string;
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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