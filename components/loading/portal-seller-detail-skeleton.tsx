import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { PortalTableBodySkeleton } from "@/components/loading/portal-table-body-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalSellerDetailSkeleton() {
  return (
    <LoadingStatus className="w-full space-y-6">
      <PortalPageHeaderSkeleton />
      <Skeleton className="h-32 w-full rounded-xl sm:h-40" aria-hidden />
      <div className="flex flex-wrap gap-3" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-52 w-full rounded-xl" aria-hidden />
      <section className="space-y-3" aria-hidden>
        <Skeleton className="h-6 w-36" />
        <PortalTableBodySkeleton rows={6} />
      </section>
    </LoadingStatus>
  );
}
