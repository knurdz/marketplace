import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { PageHeader } from "@/components/layout/page-header";
import { homePathForUser } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function RegisterPage() {
  const user = await getLoggedInUser();
  if (user) {
    redirect(homePathForUser(user));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Create account"
        description="Email and password to sign in — phone is optional."
      />
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
