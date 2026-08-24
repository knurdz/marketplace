import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./config";

/** Cookie flags shared by email sessions and OAuth callback Set-Cookie. */
export function sessionCookieOptions(expire: string) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expire),
  };
}

export async function setSessionCookie(secret: string, expire: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, sessionCookieOptions(expire));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
