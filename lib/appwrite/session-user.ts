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
