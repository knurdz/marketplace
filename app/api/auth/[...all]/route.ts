import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

type AuthHandler = ReturnType<typeof toNextJsHandler>;

let authHandler: AuthHandler | undefined;

function getAuthHandler(): AuthHandler {
  if (!authHandler) {
    authHandler = toNextJsHandler(getAuth());
  }
  return authHandler;
}

/** Lazy so `next build` can load this module without DATABASE_URL. */
export function GET(request: Request) {
  return getAuthHandler().GET(request);
}

export function POST(request: Request) {
  return getAuthHandler().POST(request);
}
