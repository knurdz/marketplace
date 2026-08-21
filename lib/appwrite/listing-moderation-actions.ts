"use server";

/**
 * Admin-only listing moderation actions.
 * Core logic in lib/services/listing-moderation.ts — not exported here for client import safety.
 */

import { revalidatePath } from "next/cache";
import { ROLE_LABELS, userHasLabel } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  approveListingCore,
  rejectListingCore,
  removeListingCore,
  setFeaturedListingCore,
} from "@/lib/services/listing-moderation";

export type ListingModerationActionState = {
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

function revalidateListingPaths(): void {
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

export async function approveListing(
  productId: string,
): Promise<ListingModerationActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }

  const result = await approveListingCore(auth.userId, productId.trim());
  if (!result.ok) return { error: result.error };

  revalidateListingPaths();
  return { success: result.message };
}

export async function rejectListing(
  productId: string,
  reason: string,
): Promise<ListingModerationActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }

  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Reason is required." };
  }

  const result = await rejectListingCore(
    auth.userId,
    productId.trim(),
    reason,
  );
  if (!result.ok) return { error: result.error };

  revalidateListingPaths();
  return { success: result.message };
}

export async function removeListing(
  productId: string,
  reason: string,
): Promise<ListingModerationActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }

  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Reason is required." };
  }

  const result = await removeListingCore(
    auth.userId,
    productId.trim(),
    reason,
  );
  if (!result.ok) return { error: result.error };

  revalidateListingPaths();
  return { success: result.message };
}

export async function setFeaturedListing(
  productId: string,
  featured: boolean,
): Promise<ListingModerationActionState> {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }

  const result = await setFeaturedListingCore(
    auth.userId,
    productId.trim(),
    featured,
  );
  if (!result.ok) return { error: result.error };

  revalidateListingPaths();
  revalidatePath("/");
  return { success: result.message };
}

/** Form action wrapper for approve (useActionState). */
export async function approveListingFormAction(
  _prev: ListingModerationActionState,
  formData: FormData,
): Promise<ListingModerationActionState> {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }
  return approveListing(productId.trim());
}

/** Form action wrapper for reject (useActionState). */
export async function rejectListingFormAction(
  _prev: ListingModerationActionState,
  formData: FormData,
): Promise<ListingModerationActionState> {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }
  const reason = formData.get("reason");
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Reason is required." };
  }
  return rejectListing(productId.trim(), reason);
}

/** Form action wrapper for remove (useActionState). */
export async function removeListingFormAction(
  _prev: ListingModerationActionState,
  formData: FormData,
): Promise<ListingModerationActionState> {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }
  const reason = formData.get("reason");
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "Reason is required." };
  }
  return removeListing(productId.trim(), reason);
}

export async function setFeaturedListingFormAction(
  _prev: ListingModerationActionState,
  formData: FormData,
): Promise<ListingModerationActionState> {
  const productId = formData.get("productId");
  const featuredRaw = formData.get("featured");
  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Missing listing." };
  }
  const featured = featuredRaw === "true" || featuredRaw === "1";
  return setFeaturedListing(productId.trim(), featured);
}
