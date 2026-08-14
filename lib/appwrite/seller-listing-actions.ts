"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addOwnProductImagesCore,
  archiveOwnProductCore,
  createDraftProductCore,
  deleteOwnProductImageCore,
  submitListingForReviewCore,
  updateOwnProductCore,
} from "@/lib/services/seller-listings";

export type CreateListingActionState = {
  error?: string;
};

export type SubmitListingActionState = {
  success?: string;
  error?: string;
};

export type EditListingActionState = {
  success?: string;
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

function readListingFields(formData: FormData) {
  return {
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    categoryId: readString(formData, "categoryId"),
    price: readString(formData, "price"),
    stock: readString(formData, "stock"),
    available: formData.get("available") === "true",
  };
}

function revalidateListingPaths(productId: string): void {
  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${productId}`);
  revalidatePath(`/products/${productId}`);
}

export async function createDraftListing(
  _prev: CreateListingActionState,
  formData: FormData,
): Promise<CreateListingActionState> {
  const result = await createDraftProductCore(
    readListingFields(formData),
    readImageFiles(formData),
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/listings");
  redirect("/seller/listings");
}

export async function updateOwnListing(
  _prev: EditListingActionState,
  formData: FormData,
): Promise<EditListingActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const result = await updateOwnProductCore(productId, readListingFields(formData));
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  return { success: result.message };
}

export async function addOwnListingImages(
  _prev: EditListingActionState,
  formData: FormData,
): Promise<EditListingActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const result = await addOwnProductImagesCore(
    productId,
    readImageFiles(formData),
  );
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  return { success: result.message };
}

export async function archiveOwnListing(
  _prev: EditListingActionState,
  formData: FormData,
): Promise<EditListingActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const result = await archiveOwnProductCore(productId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  return { success: result.message };
}

export async function deleteOwnListingImage(
  _prev: EditListingActionState,
  formData: FormData,
): Promise<EditListingActionState> {
  const productId = readString(formData, "productId");
  const imageId = readString(formData, "imageId");
  if (!productId || !imageId) {
    return { error: "Missing listing or image." };
  }

  const result = await deleteOwnProductImageCore(productId, imageId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  return { success: result.message };
}

export async function submitListingForReview(
  _prev: SubmitListingActionState,
  formData: FormData,
): Promise<SubmitListingActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const result = await submitListingForReviewCore(productId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/listings");
  revalidatePath("/admin/listings");
  return { success: result.message };
}
