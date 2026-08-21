import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { homePathForUser } from "@/lib/appwrite/roles";
import { getLoggedInUser } from "@/lib/appwrite/session";

export default async function RegisterPage() {
  const user = await getLoggedInUser();
  if (user) {
    redirect(homePathForUser(user));
  }

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --register</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Email and password to sign in — phone is optional and saved to your profile.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
