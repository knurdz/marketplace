import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasDatabaseConfig } from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import { authUser } from "@/lib/db/schema";
import { rowToMarketplaceUser, type MarketplaceUser } from "@/lib/db/users";
import { createAdminClient } from "@/lib/backend/server";
import { logError } from "@/lib/observability/log-error";

export type SessionUser = MarketplaceUser;

export const ACCOUNT_SUSPENDED_PATH = "/account-suspended" as const;

export type UserAccountState =
  | { status: "active"; user: SessionUser }
  | { status: "disabled"; userId: string }
  | { status: "missing" };

/** Distinguish missing, disabled (banned), and active accounts without granting a session. */
export async function getUserAccountStateById(
  userId: string,
): Promise<UserAccountState> {
  const db = getDb();
  const rows = await db
    .select()
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return { status: "missing" };
  }
  if (row.disabled) {
    return { status: "disabled", userId: row.id };
  }
  return { status: "active", user: rowToMarketplaceUser(row) };
}

/** Load an active (not disabled) user by id; null when missing or suspended. */
export async function getActiveUserById(
  userId: string,
): Promise<SessionUser | null> {
  const state = await getUserAccountStateById(userId);
  return state.status === "active" ? state.user : null;
}

/** Better Auth session user id when a cookie is present (includes disabled accounts). */
export async function getBetterAuthSessionUserId(): Promise<string | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Suspended accounts must not keep sessions after a successful credential check. */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  try {
    const { users } = await createAdminClient();
    await users.deleteSessions({ userId });
  } catch (error) {
    logError("auth.revoke_sessions", error, { userId });
  }
}

/**
 * Returns the logged-in user, or null when guest / misconfigured / no cookie.
 */
export async function getLoggedInUser(): Promise<SessionUser | null> {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return null;
    }
    return await getActiveUserById(session.user.id);
  } catch {
    return null;
  }
}
