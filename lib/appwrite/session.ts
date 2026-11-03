import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasDatabaseConfig } from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import { authUser } from "@/lib/db/schema";
import { rowToMarketplaceUser, type MarketplaceUser } from "@/lib/db/users";

export type SessionUser = MarketplaceUser;

/** Load an active (not disabled) user by id; null when missing or suspended. */
export async function getActiveUserById(
  userId: string,
): Promise<SessionUser | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);
  const row = rows[0];
  if (!row || row.disabled) {
    return null;
  }
  return rowToMarketplaceUser(row);
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
