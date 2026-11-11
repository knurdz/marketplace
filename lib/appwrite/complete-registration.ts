"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { AppwriteException } from "@/lib/db/appwrite-shim";
import { logError } from "@/lib/observability/log-error";
import {
  createPendingSellerProfileForUser,
  parseSellerApplicationInput,
} from "@/lib/services/seller-application";
import { DATABASE_ID, TABLE_PROFILES } from "./config";
import { resolvePostLoginPath } from "./home-path";
import {
  clearOAuthSellerIntentCookie,
  hasOAuthSellerIntent,
} from "./oauth-seller-intent";
import { getProfileRowIdForUser } from "./profiles";
import { createSessionClient } from "./server";
import { getLoggedInUser } from "./session";
import { safeNextPath } from "./roles";

export type CompleteRegistrationState = {
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function completeRegistration(
  _prev: CompleteRegistrationState,
  formData: FormData,
): Promise<CompleteRegistrationState> {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const displayName = readString(formData, "displayName");
  const phone = readString(formData, "phone");
  const next = safeNextPath(readString(formData, "next") || undefined);
  const sellerIntent = await hasOAuthSellerIntent();

  if (!displayName) {
    return { error: "Display name is required." };
  }
  if (displayName.length > 128) {
    return { error: "Display name must be at most 128 characters." };
  }
  if (phone.length > 32) {
    return { error: "Phone must be at most 32 characters." };
  }

  const sellerInput = sellerIntent
    ? parseSellerApplicationInput({
        shopName: readString(formData, "shopName"),
        slug: readString(formData, "slug") || undefined,
        bio: readString(formData, "bio") || undefined,
      })
    : null;
  if (sellerInput && !sellerInput.ok) {
    return { error: sellerInput.error };
  }

  const profileRowId = await getProfileRowIdForUser(user.$id);
  if (!profileRowId) {
    return {
      error:
        "We could not find your profile. Sign out and sign in again, or contact support.",
    };
  }

  try {
    const { tables } = await createSessionClient();
    const existing = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: profileRowId,
    });
    if (String(existing.userId ?? "") !== user.$id) {
      return { error: "Not allowed to update this profile." };
    }

    // Save name/phone first; mark complete only after seller apply succeeds (if needed).
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: profileRowId,
      data: {
        displayName,
        phone: phone || null,
        userId: user.$id,
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    logError("auth.registration.complete", error, { userId: user.$id });
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.code === 404) {
        return { error: "Not allowed to update this profile." };
      }
    }
    return { error: "Could not finish registration. Please try again." };
  }

  if (sellerIntent && sellerInput?.ok) {
    const shop = await createPendingSellerProfileForUser(user.$id, {
      shopName: sellerInput.shopName,
      slug: sellerInput.slug,
      bio: sellerInput.bio ?? undefined,
    });
    if (!shop.ok) {
      return { error: shop.error };
    }
  }

  try {
    const { tables } = await createSessionClient();
    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: profileRowId,
      data: {
        registrationComplete: true,
        userId: user.$id,
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    logError("auth.registration.complete.flag", error, { userId: user.$id });
    return { error: "Could not finish registration. Please try again." };
  }

  await clearOAuthSellerIntentCookie();
  redirect(await resolvePostLoginPath(user, next));
}
