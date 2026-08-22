import type { Models } from "node-appwrite";
import { hasAppwritePublicConfig } from "./config";
import { createSessionClient } from "./server";

/**
 * Returns the logged-in Appwrite user, or null when guest / misconfigured / no cookie.
 * Never throws for the common unauthenticated case.
 */
export async function getLoggedInUser(): Promise<Models.User<Models.Preferences> | null> {
  if (!hasAppwritePublicConfig()) {
    return null;
  }

  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    // Disabled accounts must not pass auth chokepoints (suspend enforcement).
    if (user.status === false) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
