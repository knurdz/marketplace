import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PageHeader } from "@/components/layout/page-header";
import { resolvePostLoginPath } from "@/lib/appwrite/home-path";
import { safeNextPath } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { debugLog9145e1 } from "@/lib/debug-9145e1";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next) ?? undefined;
  const user = await getLoggedInUser();
  if (user) {
    const dest = await resolvePostLoginPath(user, nextPath);
    // #region agent log
    debugLog9145e1({
      hypothesisId: "D",
      runId: "post-fix",
      location: "app/(auth)/login/page.tsx",
      message: "login page already-signed-in redirect",
      data: {
        nextPath: nextPath ?? null,
        dest,
        labels: Array.isArray(user.labels) ? user.labels : null,
      },
    });
    // #endregion
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
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
