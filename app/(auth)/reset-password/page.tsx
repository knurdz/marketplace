import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/components/auth/auth-form-styles";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  token?: string;
  secret?: string;
  userId?: string;
  error?: string;
}>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token =
    params.token?.trim() || params.secret?.trim() || "";
  const linkError = params.error?.trim();
  const validLink = Boolean(token) && !linkError;

  return (
    <main className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Reset password
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        {validLink ? (
          <>
            Choose a new password for your account.
            <br />
            Use at least 8 characters.
          </>
        ) : (
          <>
            This link is incomplete or expired.
            <br />
            Request a fresh reset email instead.
          </>
        )}
      </p>
      <div className="mt-8 space-y-6">
        {!validLink ? (
          <>
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {linkError
                ? "This reset link is invalid or has expired. Request a new one."
                : "This reset link is missing required parameters. Request a new one."}
            </p>
            <Button asChild variant="default" className={AUTH_PRIMARY_BUTTON_CLASS}>
              <Link href="/forgot-password">Request reset link</Link>
            </Button>
            <AuthBackLink href="/login">Back to sign in</AuthBackLink>
            <AuthLegalLinks />
          </>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </main>
  );
}
