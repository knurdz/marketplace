import Link from "next/link";
import { completeEmailVerification } from "@/lib/appwrite/recovery";

type SearchParams = Promise<{ userId?: string; secret?: string }>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const userId = params.userId?.trim() ?? "";
  const secret = params.secret?.trim() ?? "";

  let result: { ok: true } | { ok: false; error: string } | null = null;
  if (userId && secret) {
    result = await completeEmailVerification(userId, secret);
  }

  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --verify</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Verify email</h1>
      <div className="mt-8 space-y-4">
        {!userId || !secret ? (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
          >
            This verification link is missing required parameters. Open the link
            from your email, or request a new one from your account page.
          </p>
        ) : result?.ok ? (
          <p
            role="status"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent"
          >
            Email verified successfully.
          </p>
        ) : (
          <p
            role="alert"
            className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-accent-bright"
          >
            {result && !result.ok ? result.error : "Could not verify email."}
          </p>
        )}
        <div className="flex flex-wrap gap-4 font-mono text-sm">
          <Link href="/account" className="text-accent hover:underline">
            Account
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
