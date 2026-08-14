"use server";

/**
 * Admin-only category CRUD actions.
 * Core logic in lib/services/categories.ts — not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  createCategoryCore,
  deleteCategoryCore,
  reorderCategoriesCore,
  updateCategoryCore,
} from "@/lib/services/categories";

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
  return { ok: true, userId: user.$id };
}

function revalidateCategoryPaths(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
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
    sortOrder?: number;
  },
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }

  const result = await updateCategoryCore(auth.userId, categoryId.trim(), patch);
  if (!result.ok) return { error: result.error };

  revalidateCategoryPaths();
  return { success: result.message };
}

export async function reorderCategories(
  updates: { categoryId: string; sortOrder: number }[],
): Promise<CategoryActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const result = await reorderCategoriesCore(auth.userId, updates);
  if (!result.ok) return { error: result.error };

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

  revalidateCategoryPaths();
  return { success: result.message };
}

export async function createCategoryFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = formData.get("name");
  if (typeof name !== "string") {
    return { error: "Name is required." };
  }

  const slugRaw = formData.get("slug");
  const slug =
    typeof slugRaw === "string" && slugRaw.trim() ? slugRaw.trim() : undefined;

  const parentRaw = formData.get("parentId");
  const parentId =
    typeof parentRaw === "string" && parentRaw.trim()
      ? parentRaw.trim()
      : null;

  const sortRaw = formData.get("sortOrder");
  const sortOrder =
    typeof sortRaw === "string" && sortRaw.trim()
      ? Number(sortRaw)
      : undefined;

  return createCategory({
    name,
    slug,
    parentId,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
  });
}

export async function updateCategoryFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Missing category." };
  }

  const name = formData.get("name");
  const slugRaw = formData.get("slug");
  const parentRaw = formData.get("parentId");
  const sortRaw = formData.get("sortOrder");

  const patch: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    sortOrder?: number;
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
  if (typeof sortRaw === "string" && sortRaw.trim()) {
    const n = Number(sortRaw);
    if (Number.isFinite(n)) patch.sortOrder = n;
  }

  return updateCategory(categoryId.trim(), patch);
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

export async function reorderCategoriesFormAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const payload = formData.get("updates");
  if (typeof payload !== "string" || !payload.trim()) {
    return { error: "Missing reorder data." };
  }

  try {
    const parsed = JSON.parse(payload) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: "Invalid reorder data." };
    }
    const updates: { categoryId: string; sortOrder: number }[] = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        item !== null &&
        "categoryId" in item &&
        "sortOrder" in item &&
        typeof (item as { categoryId: unknown }).categoryId === "string" &&
        typeof (item as { sortOrder: unknown }).sortOrder === "number"
      ) {
        updates.push({
          categoryId: (item as { categoryId: string }).categoryId,
          sortOrder: (item as { sortOrder: number }).sortOrder,
        });
      } else {
        return { error: "Invalid reorder entry." };
      }
    }
    return reorderCategories(updates);
  } catch {
    return { error: "Invalid reorder data." };
  }
}
