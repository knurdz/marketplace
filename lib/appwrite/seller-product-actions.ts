"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveOwnProductCore,
  createDraftProductCore,
  updateOwnProductCore,
  type CreateDraftProductInput,
  type UpdateOwnProductInput,
} from "@/lib/services/seller-products";

export type CreateProductActionState = {
  success?: string;
  error?: string;
};

export type UpdateProductActionState = {
  success?: string;
  error?: string;
};

export type ArchiveProductActionState = {
  success?: string;
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readImageFiles(formData: FormData, key = "images"): File[] {
  const entries = formData.getAll(key);
  const files: File[] = [];
  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  }
  return files;
}

function readNumber(formData: FormData, key: string): number {
  const raw = readString(formData, key);
  if (!raw) return NaN;
  return Number(raw);
}

function readRemoveImageIds(formData: FormData): string[] {
  const entries = formData.getAll("removeImageIds");
  const ids: string[] = [];
  for (const entry of entries) {
    if (typeof entry === "string" && entry.trim()) {
      ids.push(entry.trim());
    }
  }
  return ids;
}

function revalidateListingPaths(productId: string): void {
  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${productId}/edit`);
}

export async function createDraftProduct(
  _prev: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  const input: CreateDraftProductInput = {
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    categoryId: readString(formData, "categoryId"),
    price: readNumber(formData, "price"),
    stock: readNumber(formData, "stock"),
    imageFiles: readImageFiles(formData),
  };

  const result = await createDraftProductCore(input);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/seller/listings");
  redirect("/seller/listings");
}

export async function updateOwnProduct(
  _prev: UpdateProductActionState,
  formData: FormData,
): Promise<UpdateProductActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const input: UpdateOwnProductInput = {
    productId,
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    categoryId: readString(formData, "categoryId"),
    price: readNumber(formData, "price"),
    stock: readNumber(formData, "stock"),
    removeImageIds: readRemoveImageIds(formData),
    newImageFiles: readImageFiles(formData, "newImages"),
  };

  const result = await updateOwnProductCore(input);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  return { success: result.message };
}

export async function archiveOwnProduct(
  _prev: ArchiveProductActionState,
  formData: FormData,
): Promise<ArchiveProductActionState> {
  const productId = readString(formData, "productId");
  if (!productId) {
    return { error: "Missing listing." };
  }

  const result = await archiveOwnProductCore(productId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidateListingPaths(productId);
  redirect("/seller/listings");
}
