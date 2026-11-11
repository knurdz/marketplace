import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  getAppUrl,
  getAuthAllowedHosts,
  getAuthAppOrigins,
} from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { maskEmailAddress, sendSmtpMail } from "@/lib/email/smtp";
import { renderMarketplaceEmail } from "@/lib/email/template";
import { logError } from "@/lib/observability/log-error";
import { MAX_PASSWORD_LENGTH } from "@/lib/security/password";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any;

async function sendVerificationEmail({
  user,
  url,
}: {
  user: { email: string; name?: string | null };
  url: string;
}) {
  try {
    const rendered = renderMarketplaceEmail({
      greetingName: user.name,
      title: "Verify your Knurdz Marketplace email",
      body: "Confirm your email for Knurdz Marketplace by opening the button below. If you did not create an account, you can ignore this message.",
      ctaLabel: "Verify email",
      ctaHref: url,
    });
    await sendSmtpMail({
      to: user.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    logError("auth.email.verify_send", error, {
      recipient: maskEmailAddress(user.email),
    });
    throw error;
  }
}

async function sendResetPassword({
  user,
  url,
}: {
  user: { email: string; name?: string | null };
  url: string;
}) {
  try {
    const rendered = renderMarketplaceEmail({
      greetingName: user.name,
      title: "Reset your Knurdz Marketplace password",
      body: "Reset your password by opening the button below. If you did not request a reset, you can ignore this message.",
      ctaLabel: "Reset password",
      ctaHref: url,
    });
    await sendSmtpMail({
      to: user.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    logError("auth.email.reset_send", error, {
      recipient: maskEmailAddress(user.email),
    });
    throw error;
  }
}

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
          rateLimit: schema.authRateLimit,
        },
      }),
      // Public email/password HTTP endpoints are disabled because the app calls
      // auth.api from rate-limited server actions. OAuth callbacks and token
      // link GET endpoints remain available through the Better Auth handler.
      disabledPaths: [
        "/sign-up/email",
        "/sign-in/email",
        "/request-password-reset",
        "/send-verification-email",
        "/change-email",
        "/change-password",
        "/reset-password",
      ],
      rateLimit: {
        enabled: true,
        storage: "database",
        window: 60,
        max: 60,
        customRules: {
          "/sign-up/email": { window: 60 * 60, max: 5 },
          "/sign-in/email": { window: 15 * 60, max: 5 },
          "/request-password-reset": { window: 60 * 60, max: 3 },
          "/send-verification-email": { window: 60 * 60, max: 5 },
          "/reset-password": { window: 15 * 60, max: 10 },
        },
      },
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: MAX_PASSWORD_LENGTH,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword,
      },
      // Better Auth reads verification send from this top-level key (not emailAndPassword).
      emailVerification: {
        sendVerificationEmail,
        sendOnSignUp: true,
        // Resend when an unverified user tries to sign in (they cannot use /account yet).
        sendOnSignIn: true,
        autoSignInAfterVerification: false,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          enabled: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
          // Refresh name and Google profile photo on each sign-in.
          overrideUserInfoOnSignIn: true,
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID ?? "",
          clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
          enabled: Boolean(process.env.GITHUB_CLIENT_ID?.trim()),
          overrideUserInfoOnSignIn: true,
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
        ipAddress: {
          ipAddressHeaders: ["x-vercel-forwarded-for"],
        },
        // Resolve Host / X-Forwarded-* behind reverse proxies (Hostinger, Vercel, etc.).
        trustedProxyHeaders: true,
      },
      // Per-request base URL from Host, allowlisted for local + production.
      baseURL: {
        allowedHosts: getAuthAllowedHosts(),
        protocol: "auto",
        fallback: getAppUrl(),
      },
      trustedOrigins: getAuthAppOrigins(),
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["google", "github"],
        },
      },
      // Production otherwise sends /api/auth/error, which bounces to /?error=.
      onAPIError: {
        errorURL: "/login",
      },
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
