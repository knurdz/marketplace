import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getLoggedInUser } from "@/lib/appwrite/session";

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return undefined;
  }
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const user = await getLoggedInUser();
  if (user) {
    redirect(nextPath ?? "/account");
  }

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --login</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Use your Knurdz Marketplace account.
      </p>
      <div className="mt-8">
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
