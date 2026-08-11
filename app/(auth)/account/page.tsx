import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { signOut } from "@/lib/appwrite/auth";
import {
  getOwnProfile,
} from "@/lib/appwrite/profiles";
import { getAvatarPreviewUrl } from "@/lib/appwrite/storage-urls";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function AccountPage() {
  const user = await getLoggedInUser();
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
      : "(none)";

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --session</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Signed-in session details.</p>

      <ul className="mt-8 space-y-3 rounded-md border border-border bg-card p-5 font-mono text-sm">
        <li>
          <span className="text-muted-foreground">email:</span> {user.email}
        </li>
        <li>
          <span className="text-muted-foreground">name:</span> {user.name || "—"}
        </li>
        <li>
          <span className="text-muted-foreground">id:</span> {user.$id}
        </li>
        <li>
          <span className="text-muted-foreground">labels:</span> {labels}
        </li>
        <li>
          <span className="text-muted-foreground">emailVerified:</span>{" "}
          {user.emailVerification ? (
            <span className="text-accent">true</span>
          ) : (
            <span className="text-accent-bright">false</span>
          )}
        </li>
        <li>
          <span className="text-muted-foreground">profile:</span>{" "}
          {profile ? (
            <span className="text-accent">linked ({profile.displayName})</span>
          ) : (
            <span className="text-accent-bright">missing</span>
          )}
        </li>
      </ul>

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

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-mono text-sm transition hover:bg-card"
        >
          Home
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
