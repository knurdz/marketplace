import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type SearchParams = Promise<{ userId?: string; secret?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const userId = params.userId?.trim() ?? "";
  const secret = params.secret?.trim() ?? "";

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --reset</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-muted">
        Choose a new password for your account.
      </p>
      <div className="mt-8">
        {!userId || !secret ? (
          <div className="space-y-4">
            <p
              role="alert"
              className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
            >
              This reset link is missing required parameters. Request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex font-mono text-sm text-accent hover:underline"
            >
              Request reset link
            </Link>
          </div>
        ) : (
          <ResetPasswordForm userId={userId} secret={secret} />
        )}
      </div>
    </div>
  );
}
