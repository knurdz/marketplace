import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { resolvePostLoginPath } from "@/lib/appwrite/home-path";
import { oauthErrorMessage } from "@/lib/appwrite/oauth-errors";
import { safeNextPath } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    registered?: string;
    reset?: string;
  }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next) ?? undefined;
  const oauthError = oauthErrorMessage(params.error);
  const justRegistered = params.registered === "1";
  const justReset = params.reset === "1";
  const user = await getLoggedInUser();
  if (user) {
    const dest = await resolvePostLoginPath(user, nextPath);
    redirect(dest);
  }

  return (
    <main className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Sign in to Knurdz
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        Buy from people in the community, for the community.
        <br />
        No hidden charges.
      </p>
      {justRegistered ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-green-600/30 bg-green-600/5 px-3 py-2 text-center text-sm text-green-800 dark:text-green-300"
        >
          Account created. Check your inbox to verify your email, then sign in.
        </p>
      ) : null}
      {justReset ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-green-600/30 bg-green-600/5 px-3 py-2 text-center text-sm text-green-800 dark:text-green-300"
        >
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      <div className="mt-8">
        <LoginForm nextPath={nextPath} oauthError={oauthError} />
      </div>
    </main>
  );
}
