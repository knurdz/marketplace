import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "@/lib/appwrite/auth";
import { getOwnProfile } from "@/lib/appwrite/profiles";
import { getAvatarPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { debugLog9145e1 } from "@/lib/debug-9145e1";

export default async function AccountPage() {
  const user = await getLoggedInUser();
  // #region agent log
    debugLog9145e1({
      hypothesisId: "E",
      runId: "post-fix",
      location: "app/(auth)/account/page.tsx",
    message: "account page session check",
    data: {
      hasUser: Boolean(user),
      labels: user && Array.isArray(user.labels) ? user.labels : null,
      userStatus: user ? user.status : null,
    },
  });
  // #endregion
  if (!user) {
    redirect("/login");
  }

  const profile = await getOwnProfile();
  const avatarPreviewUrl = profile
    ? getAvatarPreviewUrl(profile.avatarFileId)
    : null;
  const labels =
    Array.isArray(user.labels) && user.labels.length > 0
      ? user.labels.join(", ")
      : "buyer";

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Session details and profile fields for this account."
      />

      <Card className="mt-8">
        <CardContent className="space-y-2 pt-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email</span>
            <span className="mt-0.5 block">{user.email}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Roles</span>
            <span className="mt-0.5 block font-mono text-xs">{labels}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Verified</span>
            <span className="mt-0.5 block">
              {user.emailVerification ? "Yes" : "Not yet"}
            </span>
          </p>
        </CardContent>
      </Card>

      {!user.emailVerification ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Your email is not verified yet. Resend a verification link:
          </p>
          <ResendVerificationForm />
        </div>
      ) : null}

      {profile ? (
        <ProfileForm profile={profile} avatarPreviewUrl={avatarPreviewUrl} />
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="secondary" asChild>
          <Link href="/market">Market</Link>
        </Button>
        <form action={signOut}>
          <Button type="submit">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
