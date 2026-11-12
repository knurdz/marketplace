import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PortalFormPageSkeletonProps = {
  className?: string;
  showHeaderAction?: boolean;
  variant?: "default" | "listing";
};

export function PortalFormPageSkeleton({
  className,
  showHeaderAction = true,
  variant = "default",
}: PortalFormPageSkeletonProps) {
  return (
    <LoadingStatus className={cn("w-full space-y-6", className)}>
      <PortalPageHeaderSkeleton showAction={showHeaderAction} />
      <div className="space-y-4" aria-hidden>
        {variant === "listing" ? (
          <Skeleton className="aspect-video w-full rounded-xl" />
        ) : null}
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        {variant === "default" ? (
          <Skeleton className="h-32 w-full rounded-md" />
        ) : (
          <Skeleton className="h-24 w-full rounded-md" />
        )}
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </LoadingStatus>
  );
}
