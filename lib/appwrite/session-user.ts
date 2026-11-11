import type { SessionUser } from "./session";

/** Plain session user safe to pass across the React server/client boundary. */
export type SessionUserView = {
  email: string;
  name: string;
  labels: string[];
};

export function toSessionUserView(user: SessionUser): SessionUserView {
  return {
    email: user.email,
    name: user.name ?? "",
    labels: Array.isArray(user.labels) ? [...user.labels] : [],
  };
}

/** Portal home for signed-in admin/seller views (client-safe). */
export function portalHomeForSessionUser(
  user: Pick<SessionUserView, "labels">,
): "/admin" | "/seller" | null {
  if (user.labels.includes("admin")) return "/admin";
  if (user.labels.includes("seller")) return "/seller";
  return null;
}
