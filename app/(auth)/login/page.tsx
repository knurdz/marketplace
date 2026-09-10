import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PageHeader } from "@/components/layout/page-header";
import { resolvePostLoginPath } from "@/lib/appwrite/home-path";
import { oauthErrorMessage } from "@/lib/appwrite/oauth-errors";
import { safeNextPath } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next) ?? undefined;
  const oauthError = oauthErrorMessage(params.error);
  const user = await getLoggedInUser();
  if (user) {
    const dest = await resolvePostLoginPath(user, nextPath);
    redirect(dest);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Sign in"
        description="Use your Knurdz Marketplace account."
      />
      <div className="mt-8">
        <LoginForm nextPath={nextPath} oauthError={oauthError} />
      </div>
    </div>
  );
}
