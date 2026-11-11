import type { SessionUserView } from "@/lib/appwrite/session-user";

/** First name for portal welcome line (real profile or email local-part). */
export function portalWelcomeName(
  user: SessionUserView,
  displayName?: string | null,
): string {
  const source = displayName?.trim() || user.name.trim() || user.email.split("@")[0] || "";
  const first = source.split(/\s+/).filter(Boolean)[0];
  return first || "there";
}
