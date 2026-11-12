import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { PortalTableBodySkeleton } from "@/components/loading/portal-table-body-skeleton";
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
      <PortalTableBodySkeleton rows={rows} />
    </LoadingStatus>
  );
}
