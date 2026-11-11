import { redirect } from "next/navigation";
import { CompleteRegistrationForm } from "@/components/auth/complete-registration-form";
import { resolvePostLoginPath } from "@/lib/appwrite/home-path";
import { hasOAuthSellerIntent } from "@/lib/appwrite/oauth-seller-intent";
import { createProfileForUser, getOwnProfile } from "@/lib/appwrite/profiles";
import { safeNextPath } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function RegisterCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next) ?? undefined;
  const user = await getLoggedInUser();
  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }

  let profile = await getOwnProfile();
  if (!profile) {
    try {
      profile = await createProfileForUser({
        userId: user.$id,
        email: user.email,
        name: user.name || undefined,
        registrationComplete: false,
      });
    } catch {
      profile = await getOwnProfile();
    }
  }

  if (profile?.registrationComplete) {
    redirect(await resolvePostLoginPath(user, nextPath));
  }

  const sellerIntent = await hasOAuthSellerIntent();
  const displayName =
    profile?.displayName ||
    user.name?.trim() ||
    user.email.split("@")[0] ||
    "User";

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Finish registration
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        {sellerIntent ? (
          <>
            Confirm your name and shop details.
            <br />
            We&apos;ll review your seller application next.
          </>
        ) : (
          <>
            Confirm your name so we can finish setting up your account.
            <br />
            You&apos;re almost there.
          </>
        )}
      </p>
      <div className="mt-8">
        <CompleteRegistrationForm
          displayName={displayName}
          phone={profile?.phone}
          sellerIntent={sellerIntent}
          nextPath={nextPath}
        />
      </div>
    </main>
  );
}
