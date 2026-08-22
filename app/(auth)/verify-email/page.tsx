import Link from "next/link";
import { completeEmailVerification } from "@/lib/appwrite/recovery";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

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
      <PageHeader eyebrow="Account" title="Verify email" />
      <div className="mt-8 space-y-4">
        {!userId || !secret ? (
          <p
            role="alert"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            This verification link is missing required parameters. Open the link
            from your email, or request a new one from your account page.
          </p>
        ) : result?.ok ? (
          <p
            role="status"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            Email verified successfully.
          </p>
        ) : (
          <p
            role="alert"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            {result && !result.ok ? result.error : "Could not verify email."}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/account">Account</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
