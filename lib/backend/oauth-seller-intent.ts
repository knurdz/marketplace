import { cookies } from "next/headers";

/** HttpOnly flag: social sign-up chose seller; cleared after /register/complete. */
export const OAUTH_SELLER_INTENT_COOKIE = "knurdz_oauth_seller_intent";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 15,
};

export async function setOAuthSellerIntentCookie(): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_SELLER_INTENT_COOKIE, "1", cookieOptions);
}

export async function clearOAuthSellerIntentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(OAUTH_SELLER_INTENT_COOKIE);
}

export async function hasOAuthSellerIntent(): Promise<boolean> {
  const store = await cookies();
  return store.get(OAUTH_SELLER_INTENT_COOKIE)?.value === "1";
}
