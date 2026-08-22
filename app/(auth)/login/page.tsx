import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PageHeader } from "@/components/layout/page-header";
import { postLoginPath, safeNextPath } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next) ?? undefined;
  const user = await getLoggedInUser();
  if (user) {
    redirect(postLoginPath(user, nextPath));
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
