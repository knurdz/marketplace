import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { resolveHomePath } from "@/lib/backend/home-path";
import { oauthErrorMessage } from "@/lib/backend/oauth-errors";
import { getLoggedInUser } from "@/lib/backend/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata(
  "Create Account",
  "Create a Knurdz Marketplace buyer account or apply as a community seller.",
);

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const oauthError = oauthErrorMessage(params.error);
  const user = await getLoggedInUser();
  if (user) {
    redirect(await resolveHomePath(user));
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        Join as a buyer, or apply as a seller.
        <br />
        Social sign-up asks for any missing details next.
      </p>
      <div className="mt-8">
        <RegisterForm oauthError={oauthError} />
      </div>
    </main>
  );
}
