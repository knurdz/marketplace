"use server";

import { revalidatePath } from "next/cache";
import { submitSellerApplicationCore } from "@/lib/services/seller-application";

export type SellerApplicationActionState = {
  success?: string;
  error?: string;
};

function revalidateSellerApplicationPaths(): void {
  revalidatePath("/become-seller");
  revalidatePath("/seller");
}

export async function submitSellerApplication(
  _prev: SellerApplicationActionState,
  formData: FormData,
): Promise<SellerApplicationActionState> {
  const shopName = formData.get("shopName");
  const slug = formData.get("slug");
  const bio = formData.get("bio");

  const result = await submitSellerApplicationCore({
    shopName: typeof shopName === "string" ? shopName : "",
    slug: typeof slug === "string" && slug.trim() ? slug : undefined,
    bio: typeof bio === "string" && bio.trim() ? bio : undefined,
  });

  if (!result.ok) return { error: result.error };

  revalidateSellerApplicationPaths();
  return { success: result.message };
}
