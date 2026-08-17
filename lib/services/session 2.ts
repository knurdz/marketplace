import type { Models } from "node-appwrite";
import { getLoggedInUser } from "@/lib/appwrite/session";

/**
 * Stable session contract for Members 2–4.
 * Null when guest / misconfigured / no cookie (never throws for that case).
 */
export async function getSessionUser(): Promise<Models.User<Models.Preferences> | null> {
  return getLoggedInUser();
}
