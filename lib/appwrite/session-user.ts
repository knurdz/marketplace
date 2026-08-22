import type { Models } from "node-appwrite";

/** Plain session user safe to pass across the React server/client boundary. */
export type SessionUserView = {
  email: string;
  name: string;
  labels: string[];
};

export function toSessionUserView(
  user: Models.User<Models.Preferences>,
): SessionUserView {
  return {
    email: user.email,
    name: user.name ?? "",
    labels: Array.isArray(user.labels) ? [...user.labels] : [],
  };
}
