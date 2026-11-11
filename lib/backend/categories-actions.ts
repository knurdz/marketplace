"use server";

/**
 * Admin-only category CRUD actions.
 * Core logic in lib/services/categories.ts: not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { BUCKET_CATEGORIES } from "@/lib/backend/config";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";
import { getLoggedInUser } from "@/lib/backend/session";
import { deleteFileAsAdmin, uploadCategoryImage } from "@/lib/backend/storage";
import {
  createCategoryCore,
  deleteCategoryCore,
  updateCategoryCore,
} from "@/lib/services/categories";
import {
  assertAdminMutationRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/security/rate-limit";

export type CategoryActionState = {
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

function revalidateCategoryPaths(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
}

async function cleanupCategoryImage(fileId: string | null | undefined) {
  const id = fileId?.trim();
  if (!id) return;
  try {
    await deleteFileAsAdmin(BUCKET_CATEGORIES, id);
  } catch {
    // Best-effort cleanup
  }
}

function readOptionalImage(formData: FormData): File | null {
  const entry = formData.get("image");
  if (!(entry instanceof File) || entry.size <= 0) return null;
  return entry;
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  parentId?: string | null;
  imageFileId?: string | null;
}): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof input.name !== "string") {
    return { error: "Name is required." };
  }

  const result = await createCategoryCore(auth.userId, input);
  if (!result.ok) return { error: result.error };

  revalidateCategoryPaths();
  return { success: result.message };
}

export async function updateCategory(
  categoryId: string,
  patch: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    imageFileId?: string | null;
  },
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }

  const result = await updateCategoryCore(
    auth.userId,
    categoryId.trim(),
    patch,
  );
  if (!result.ok) return { error: result.error };

  if (result.replacedImageFileId) {
    await cleanupCategoryImage(result.replacedImageFileId);
  }

  revalidateCategoryPaths();
  return { success: result.message };
}

export async function deleteCategory(
  categoryId: string,
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }

  const result = await deleteCategoryCore(auth.userId, categoryId.trim());
  if (!result.ok) return { error: result.error };

  if (result.replacedImageFileId) {
    await cleanupCategoryImage(result.replacedImageFileId);
  }

  revalidateCategoryPaths();
  return { success: result.message };
}

export async function createCategoryFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const name = formData.get("name");
  if (typeof name !== "string") {
    return { error: "Name is required." };
  }

  const slugRaw = formData.get("slug");
  const slug =
    typeof slugRaw === "string" && slugRaw.trim() ? slugRaw.trim() : undefined;

  const parentRaw = formData.get("parentId");
  const parentId =
    typeof parentRaw === "string" && parentRaw.trim() ? parentRaw.trim() : null;

  const image = readOptionalImage(formData);
  let imageFileId: string | undefined;
  if (image) {
    try {
      const uploaded = await uploadCategoryImage(image);
      imageFileId = uploaded.fileId;
    } catch {
      return { error: "Could not upload category image. Please try again." };
    }
  }

  const result = await createCategory({
    name,
    slug,
    parentId,
    imageFileId,
  });

  if (result.error && imageFileId) {
    await cleanupCategoryImage(imageFileId);
  }

  return result;
}

export async function updateCategoryFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }

  const name = formData.get("name");
  const slugRaw = formData.get("slug");
  const parentRaw = formData.get("parentId");

  const patch: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    imageFileId?: string | null;
  } = {};

  if (typeof name === "string" && name.trim()) {
    patch.name = name;
  }
  if (typeof slugRaw === "string" && slugRaw.trim()) {
    patch.slug = slugRaw.trim();
  }
  if (parentRaw !== null) {
    patch.parentId =
      typeof parentRaw === "string" && parentRaw.trim()
        ? parentRaw.trim()
        : null;
  }

  const image = readOptionalImage(formData);
  let uploadedFileId: string | undefined;
  if (image) {
    try {
      const uploaded = await uploadCategoryImage(image);
      uploadedFileId = uploaded.fileId;
      patch.imageFileId = uploadedFileId;
    } catch {
      return { error: "Could not upload category image. Please try again." };
    }
  }

  const result = await updateCategory(categoryId.trim(), patch);
  if (result.error && uploadedFileId) {
    await cleanupCategoryImage(uploadedFileId);
  }
  return result;
}

export async function deleteCategoryFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }
  return deleteCategory(categoryId.trim());
}
