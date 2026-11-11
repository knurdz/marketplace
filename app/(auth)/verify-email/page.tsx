import type { Metadata } from "next";
import Link from "next/link";
import { completeEmailVerification } from "@/lib/backend/recovery";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import { VerifyEmailToast } from "@/components/auth/verify-email-toast";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Verify Email");

type SearchParams = Promise<{
  token?: string;
  secret?: string;
  verified?: string;
  error?: string;
}>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = params.token?.trim() || params.secret?.trim() || "";
  const linkError = params.error?.trim();
  const redirectedOk = params.verified === "1" && !linkError;

  // Better Auth verifies at /api/auth/verify-email then redirects here with verified=1.
  // Optional token path supports completing verification from this page directly.
  let result: { ok: true } | { ok: false; error: string } | null = null;
  if (token && !linkError) {
    result = await completeEmailVerification("", token);
  }

  const success = redirectedOk || Boolean(result?.ok);
  const failed = Boolean(linkError) || Boolean(result && !result.ok);
  const missingParams = !success && !failed;

  const defaultFailureMessage =
    "This verification link is invalid or has expired.";
  const failureMessage =
    (result && !result.ok ? result.error : null) ??
    (linkError
      ? "We couldn't verify your email. Request a new link from your account."
      : null) ??
    (missingParams
      ? "This verification link is missing required parameters."
      : defaultFailureMessage);

  const toastStatus: "success" | "error" | null = success
    ? "success"
    : failed || missingParams
      ? "error"
      : null;
  const toastMessage = success
    ? "Email verified. Sign in to continue."
    : toastStatus === "error"
      ? failureMessage
      : "";

  return (
    <main className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <VerifyEmailToast status={toastStatus} message={toastMessage} />
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        {success ? "Email verified" : "Verify email"}
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        {success ? (
          <>
            Your address is confirmed.
            <br />
            You can sign in and use your account.
          </>
        ) : failed ? (
          <>
            We couldn&apos;t confirm this link.
            <br />
            Request a new verification email from your account page.
          </>
        ) : (
          <>
            Open the full link from your inbox.
            <br />
            Or resend verification from your account after you can sign in.
          </>
        )}
      </p>

      <div className="mt-8 space-y-6">
        {success ? (
          <p
            role="status"
            className="rounded-lg border border-green-600/30 bg-green-600/5 px-3 py-2 text-sm text-green-800 dark:text-green-300"
          >
            Email verified successfully.
          </p>
        ) : failed ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {result && !result.ok
              ? result.error
              : "This verification link is invalid or has expired."}
          </p>
        ) : missingParams ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            This verification link is missing required parameters. Open the link
            from your email, or request a new one from your account page after
            signing in.
          </p>
        ) : null}

        <div className="space-y-3">
          <Button asChild variant="default" className={AUTH_PRIMARY_BUTTON_CLASS}>
            <Link href="/login">Sign in</Link>
          </Button>
          {!success ? (
            <AuthBackLink href="/account">Go to account</AuthBackLink>
          ) : null}
        </div>

        <AuthLegalLinks />
      </div>
    </main>
  );
}
