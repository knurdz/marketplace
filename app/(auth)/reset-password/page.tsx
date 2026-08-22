import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

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
      <PageHeader
        eyebrow="Account"
        title="Reset password"
        description="Choose a new password for your account."
      />
      <div className="mt-8">
        {!userId || !secret ? (
          <div className="space-y-4">
            <p
              role="alert"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              This reset link is missing required parameters. Request a new one.
            </p>
            <Button asChild>
              <Link href="/forgot-password">Request reset link</Link>
            </Button>
          </div>
        ) : (
          <ResetPasswordForm userId={userId} secret={secret} />
        )}
      </div>
    </div>
  );
}
