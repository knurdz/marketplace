import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getAppUrl } from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: "mysql",
        schema: {
          user: schema.authUser,
          session: schema.authSession,
          account: schema.authAccount,
          verification: schema.authVerification,
        },
      }),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          enabled: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
          enabled: Boolean(process.env.FACEBOOK_CLIENT_ID?.trim()),
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: false,
            defaultValue: "buyer",
            input: false,
          },
          disabled: {
            type: "boolean",
            required: false,
            defaultValue: false,
            input: false,
          },
        },
      },
      advanced: {
        cookiePrefix: "knurdz",
      },
      baseURL: getAppUrl(),
      trustedOrigins: [getAppUrl()],
      // Server actions call auth.api directly; without this, Set-Cookie is dropped. Must stay last.
      plugins: [nextCookies()],
    });
  }
  return instance;
}

export const auth = {
  get api() {
    return getAuth().api;
  },
};
