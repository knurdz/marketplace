import type { Metadata } from "next";
import Link from "next/link";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthLegalLinks } from "@/components/auth/auth-legal-links";
import { getPublicSupportEmail } from "@/lib/platform-settings/public-support-email";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata(
  "Account suspended",
  "Your Knurdz Marketplace account has been suspended.",
);

export default async function AccountSuspendedPage() {
  const supportEmail = await getPublicSupportEmail();

  return (
    <main className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Your account has been banned
      </h1>
      <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
        You cannot sign in or use the marketplace until an administrator
        restores your account.
      </p>
      <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
        If you believe this is a mistake, contact us at{" "}
        <a
          href={`mailto:${supportEmail}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {supportEmail}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-col items-center gap-3">
        <AuthBackLink href="/login">Back to sign in</AuthBackLink>
        <p className="text-center text-xs text-muted-foreground">
          Need the storefront?{" "}
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            Browse Knurdz
          </Link>
        </p>
      </div>
      <AuthLegalLinks />
    </main>
  );
}
