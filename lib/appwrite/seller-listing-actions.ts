"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDraftProductCore } from "@/lib/services/seller-listings";

export type CreateListingActionState = {
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readImageFiles(formData: FormData): File[] {
  const entries = formData.getAll("images");
  return entries.filter((e): e is File => e instanceof File && e.size > 0);
}

export async function createDraftListing(
  _prev: CreateListingActionState,
  formData: FormData,
): Promise<CreateListingActionState> {
  const result = await createDraftProductCore(
    {
      title: readString(formData, "title"),
      description: readString(formData, "description"),
      categoryId: readString(formData, "categoryId"),
      price: readString(formData, "price"),
      stock: readString(formData, "stock"),
    },
    readImageFiles(formData),
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/listings");
  redirect("/seller/listings");
}
