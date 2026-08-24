import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { PageHeader } from "@/components/layout/page-header";
import { resolveHomePath } from "@/lib/appwrite/home-path";
import { oauthErrorMessage } from "@/lib/appwrite/oauth-errors";
import { getLoggedInUser } from "@/lib/appwrite/session";

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
    <div>
      <PageHeader
        eyebrow="Account"
        title="Create account"
        description="Register as a buyer to shop, or as a seller to apply for a shop. Admin accounts are created by the team."
      />
      <div className="mt-8">
        <RegisterForm oauthError={oauthError} />
      </div>
    </div>
  );
}
