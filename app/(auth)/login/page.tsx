import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
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
      <p className="font-mono text-sm text-accent">$ ./auth --login</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your Knurdz Marketplace account.
      </p>
      <div className="mt-8">
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
