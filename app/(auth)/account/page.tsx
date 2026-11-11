import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { StatusPill } from "@/components/layout/status-pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarStorageImage } from "@/components/ui/avatar-storage-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/lib/backend/auth";
import { getOwnProfile } from "@/lib/backend/profiles";
import {
  ROLE_LABELS,
  userHasLabel,
} from "@/lib/backend/roles";
import { getLoggedInUser } from "@/lib/backend/session";
import { resolveAvatarUrl } from "@/lib/backend/storage-urls";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Account");

function roleLabel(user: {
  labels?: string[];
}): { label: string; showBuyerNav: boolean } {
  if (userHasLabel(user, ROLE_LABELS.admin)) {
    return { label: "Admin", showBuyerNav: false };
  }
  if (userHasLabel(user, ROLE_LABELS.seller)) {
    return { label: "Seller", showBuyerNav: false };
  }
  return { label: "Buyer", showBuyerNav: true };
}

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "K") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase().slice(0, 2);
}

export default async function AccountPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getOwnProfile();
  const avatarPreviewUrl = resolveAvatarUrl(
    profile?.avatarFileId,
    user.image,
  );
  const { label: accountRole, showBuyerNav } = roleLabel(user);
  const displayName =
    profile?.displayName?.trim() || user.name?.trim() || user.email;
  const initials = initialsFrom(displayName, user.email);

  return (
    <BuyerAccountShell
      title="Account"
      description="Profile details and session for this account."
      showBuyerNav={showBuyerNav}
      actions={
        showBuyerNav ? (
          <Button variant="secondary" size="sm" asChild>
            <Link href="/market">Browse market</Link>
          </Button>
        ) : (
          <Button variant="secondary" size="sm" asChild>
            <Link href={accountRole === "Admin" ? "/admin" : "/seller"}>
              Back to portal
            </Link>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <Card className="rounded-2xl border-border/80 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 rounded-2xl">
                {avatarPreviewUrl ? (
                  <AvatarStorageImage
                    src={avatarPreviewUrl}
                    alt=""
                    className="rounded-2xl"
                  />
                ) : null}
                <AvatarFallback className="rounded-2xl text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusPill tone="neutral" label={accountRole} />
                  <StatusPill
                    tone={user.emailVerification ? "positive" : "warning"}
                    label={
                      user.emailVerification ? "Email verified" : "Unverified"
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!user.emailVerification ? (
          <Card className="rounded-2xl border-amber-200/80 bg-amber-50/50 shadow-none dark:border-amber-800/60 dark:bg-amber-950/30">
            <CardHeader>
              <CardTitle className="text-base">Verify your email</CardTitle>
              <CardDescription>
                Confirm your address so sellers can trust purchase requests from
                you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResendVerificationForm />
            </CardContent>
          </Card>
        ) : null}

        {profile ? (
          <ProfileForm
            profile={profile}
            avatarPreviewUrl={avatarPreviewUrl}
          />
        ) : (
          <Card className="rounded-2xl border-border/80 shadow-none">
            <CardContent className="pt-1">
              <p className="text-sm text-muted-foreground">
                Profile is still loading. Refresh if this persists.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Sign out on this device. You can sign back in anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </BuyerAccountShell>
  );
}
