import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SellerProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

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
          <Badge
            variant="outline"
            className={cn(
              "border-orange-200/90 bg-orange-50/95 text-orange-800",
              "dark:border-orange-800/55 dark:bg-orange-950/45 dark:text-orange-300",
            )}
          >
            <Clock data-icon="inline-start" aria-hidden />
            Pending
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your shop <strong>{profile.shopName}</strong> (
          <span className="font-mono">{profile.slug}</span>) is waiting for
          admin approval. You will get seller portal access once approved. This
          account cannot shop the buyer market.
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
          Only one application is allowed per account. Sign out to register a
          buyer account instead.
        </p>
      </div>
    );
  }

  return null;
}
