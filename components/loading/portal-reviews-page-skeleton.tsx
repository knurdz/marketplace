import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalReviewsPageSkeleton() {
  return (
    <LoadingStatus className="w-full space-y-6">
      <PortalPageHeaderSkeleton showAction={false} />
      <div className="flex flex-wrap gap-3" aria-hidden>
        <Skeleton className="h-20 w-36 rounded-xl" />
        <Skeleton className="h-20 w-36 rounded-xl" />
        <Skeleton className="h-20 w-36 rounded-xl" />
      </div>
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </LoadingStatus>
  );
}
