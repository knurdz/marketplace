"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { DbException } from "@/lib/db/compat";
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
import { verifyFormGuard } from "@/lib/security/bot-guard";
import { isValidPhone } from "@/lib/security/contact";
import { sellerApplicationFieldErrors } from "@/lib/backend/seller-field-errors";

export type CompleteRegistrationFieldKey =
  | "displayName"
  | "phone"
  | "shopName"
  | "slug"
  | "bio";

export type CompleteRegistrationFieldErrors = Partial<
  Record<CompleteRegistrationFieldKey, string>
>;

export type CompleteRegistrationValues = {
  displayName: string;
  phone: string;
  shopName: string;
  slug: string;
  bio: string;
};

export type CompleteRegistrationState = {
  error?: string;
  fieldErrors?: CompleteRegistrationFieldErrors;
  values?: CompleteRegistrationValues;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readCompleteRegistrationValues(
  formData: FormData,
): CompleteRegistrationValues {
  return {
    displayName: readString(formData, "displayName"),
    phone: readString(formData, "phone"),
    shopName: readString(formData, "shopName"),
    slug: readString(formData, "slug"),
    bio: readString(formData, "bio"),
  };
}

function completeRegistrationFail(
  error: string,
  values: CompleteRegistrationValues,
  fieldErrors?: CompleteRegistrationFieldErrors,
): CompleteRegistrationState {
  return { error, values, fieldErrors };
}

const failComplete = (
  error: string,
  values: CompleteRegistrationValues,
  fieldErrors?: CompleteRegistrationFieldErrors,
) => completeRegistrationFail(error, values, fieldErrors);

export async function completeRegistration(
  _prev: CompleteRegistrationState,
  formData: FormData,
): Promise<CompleteRegistrationState> {
  const values = readCompleteRegistrationValues(formData);
  const guard = await verifyFormGuard(formData, "auth.registration.complete");
  if (!guard.ok) {
    return completeRegistrationFail(
      "Could not submit this form. Please refresh and try again.",
      values,
    );
  }

  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { displayName, phone } = values;
  const next = safeNextPath(readString(formData, "next") || undefined);
  const sellerIntent = await hasOAuthSellerIntent();

  if (!displayName) {
    return failComplete("Display name is required.", values, {
      displayName: "Display name is required.",
    });
  }
  if (displayName.length > 128) {
    const msg = "Display name must be at most 128 characters.";
    return failComplete(msg, values, { displayName: msg });
  }
  if (phone.length > 32) {
    const msg = "Phone must be at most 32 characters.";
    return failComplete(msg, values, { phone: msg });
  }
  if (phone && !isValidPhone(phone)) {
    const msg =
      "Enter a valid phone number (at least 8 digits; + and spaces allowed).";
    return failComplete(msg, values, { phone: msg });
  }

  const sellerInput = sellerIntent
    ? parseSellerApplicationInput({
        shopName: values.shopName,
        slug: values.slug || undefined,
        bio: values.bio || undefined,
      })
    : null;
  if (sellerInput && !sellerInput.ok) {
    return failComplete(
      sellerInput.error,
      values,
      sellerApplicationFieldErrors(sellerInput.error),
    );
  }

  const profileRowId = await getProfileRowIdForUser(user.$id);
  if (!profileRowId) {
    return completeRegistrationFail(
      "We could not find your profile. Sign out and sign in again, or contact support.",
      values,
    );
  }

  try {
    const { tables } = await createSessionClient();
    const existing = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: profileRowId,
    });
    if (String(existing.userId ?? "") !== user.$id) {
      return completeRegistrationFail(
        "Not allowed to update this profile.",
        values,
      );
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
    if (error instanceof DbException) {
      if (error.code === 401 || error.code === 404) {
        return completeRegistrationFail(
          "Not allowed to update this profile.",
          values,
        );
      }
    }
    return completeRegistrationFail(
      "Could not finish registration. Please try again.",
      values,
    );
  }

  if (sellerIntent && sellerInput?.ok) {
    const shop = await createPendingSellerProfileForUser(user.$id, {
      shopName: sellerInput.shopName,
      slug: sellerInput.slug,
      bio: sellerInput.bio ?? undefined,
    });
    if (!shop.ok) {
      return completeRegistrationFail(shop.error, values);
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
    return completeRegistrationFail(
      "Could not finish registration. Please try again.",
      values,
    );
  }

  await clearOAuthSellerIntentCookie();
  redirect(await resolvePostLoginPath(user, next));
}
