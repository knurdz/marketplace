import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

type PortalTablePageSkeletonProps = {
  rows?: number;
  showToolbar?: boolean;
};

export function PortalTablePageSkeleton({
  rows = 6,
  showToolbar = true,
}: PortalTablePageSkeletonProps) {
  return (
    <LoadingStatus className="w-full space-y-6">
      <PortalPageHeaderSkeleton />
      {showToolbar ? (
        <div className="flex flex-wrap gap-2" aria-hidden>
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="ml-auto h-9 w-28 rounded-md" />
        </div>
      ) : null}
      <div
        className="overflow-hidden rounded-xl border border-border"
        aria-hidden
      >
        <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-12" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      </div>
    </LoadingStatus>
  );
}
