import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalDashboardSkeleton() {
  return (
    <LoadingStatus className="w-full space-y-8">
      <PortalPageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" aria-hidden />
      <div className="overflow-hidden rounded-xl border border-border" aria-hidden>
        <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
    </LoadingStatus>
  );
}
