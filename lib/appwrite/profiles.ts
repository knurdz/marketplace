"use server";

import { AppwriteException, Permission, Role } from "node-appwrite";
import { DATABASE_ID, TABLE_PROFILES } from "./config";
import { createAdminClient, createSessionClient } from "./server";
import { getLoggedInUser } from "./session";

export type Profile = {
  $id: string;
  userId: string;
  displayName: string;
  avatarFileId: string | null;
  phone: string | null;
  bio: string | null;
};

export type ProfileActionState = {
  error?: string;
  success?: string;
};

function asProfile(row: Record<string, unknown>): Profile {
  return {
    $id: String(row.$id),
    userId: String(row.userId ?? ""),
    displayName: String(row.displayName ?? ""),
    avatarFileId:
      typeof row.avatarFileId === "string" && row.avatarFileId.length > 0
        ? row.avatarFileId
        : null,
    phone:
      typeof row.phone === "string" && row.phone.length > 0 ? row.phone : null,
    bio: typeof row.bio === "string" && row.bio.length > 0 ? row.bio : null,
  };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function defaultDisplayName(name: string | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed.slice(0, 128);
  const local = email.split("@")[0]?.trim() || "User";
  return local.slice(0, 128);
}

/**
 * Admin-only: create profile row for a new Auth user (rowId === userId).
 * Sets row permissions so only that user can read/update.
 */
export async function createProfileForUser(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<Profile> {
  const { tables } = await createAdminClient();
  const row = await tables.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_PROFILES,
    rowId: params.userId,
    data: {
      userId: params.userId,
      displayName: defaultDisplayName(params.name, params.email),
    },
    permissions: [
      Permission.read(Role.user(params.userId)),
      Permission.update(Role.user(params.userId)),
    ],
  });
  return asProfile(row as unknown as Record<string, unknown>);
}

/** Load the signed-in user's profile (null if missing / guest). */
export async function getOwnProfile(): Promise<Profile | null> {
  const user = await getLoggedInUser();
  if (!user) return null;

  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: user.$id,
    });
    const profile = asProfile(row as unknown as Record<string, unknown>);
    // Defense in depth: never return another user's row even if IDs diverge.
    if (profile.userId !== user.$id) {
      return null;
    }
    return profile;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }
    return null;
  }
}

/**
 * Own-only profile update. Ignores any client-supplied userId;
 * always updates the session user's row.
 */
export async function updateOwnProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const displayName = readString(formData, "displayName");
  const phone = readString(formData, "phone");
  const bio = readString(formData, "bio");

  if (!displayName) {
    return { error: "Display name is required." };
  }
  if (displayName.length > 128) {
    return { error: "Display name must be at most 128 characters." };
  }
  if (phone.length > 32) {
    return { error: "Phone must be at most 32 characters." };
  }
  if (bio.length > 1000) {
    return { error: "Bio must be at most 1000 characters." };
  }

  try {
    const { tables } = await createSessionClient();
    const existing = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: user.$id,
    });
    const existingProfile = asProfile(
      existing as unknown as Record<string, unknown>,
    );
    if (existingProfile.userId !== user.$id) {
      return { error: "Not allowed to update this profile." };
    }

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: user.$id,
      data: {
        displayName,
        phone: phone || null,
        bio: bio || null,
        // Never allow client to change userId / avatar here (avatar in 1.8).
        userId: user.$id,
      },
    });
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.code === 404) {
        return { error: "Not allowed to update this profile." };
      }
      return { error: "Could not update profile. Please try again." };
    }
    return { error: "Could not update profile. Please try again." };
  }

  return { success: "Profile updated." };
}
