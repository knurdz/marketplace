import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { SellerProfile } from "@/lib/types";

type SellerApplicationStatusProps = {
  profile: SellerProfile;
};

export function SellerApplicationStatus({
  profile,
}: SellerApplicationStatusProps) {
  if (profile.status === "pending") {
    return (
      <div className="mt-8 rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">Application under review</p>
          <Badge variant="secondary">Pending</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your shop <strong>{profile.shopName}</strong> (
          <span className="font-mono">{profile.slug}</span>) is waiting for
          admin approval. You will get seller portal access once approved.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/" className="text-accent hover:underline">
            Back to storefront
          </Link>
        </p>
      </div>
    );
  }

  if (profile.status === "rejected") {
    return (
      <div className="mt-8 rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">Application not approved</p>
          <Badge variant="destructive">Rejected</Badge>
        </div>
        {profile.rejectionReason ? (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span>{" "}
            {profile.rejectionReason}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Your seller application was rejected. Contact support if you have
            questions.
          </p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Re-application will be available in a later update.{" "}
          <Link href="/" className="text-accent hover:underline">
            Back to storefront
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
