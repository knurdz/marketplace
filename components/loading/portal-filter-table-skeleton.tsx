import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { PortalTableBodySkeleton } from "@/components/loading/portal-table-body-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

type PortalFilterTableSkeletonProps = {
  rows?: number;
  filterVariant?: "toolbar" | "tabs" | "audit";
};

export function PortalFilterTableSkeleton({
  rows = 8,
  filterVariant = "toolbar",
}: PortalFilterTableSkeletonProps) {
  return (
    <LoadingStatus className="w-full space-y-6">
      <PortalPageHeaderSkeleton />
      {filterVariant === "tabs" ? (
        <div className="flex flex-wrap gap-2" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      ) : filterVariant === "audit" ? (
        <div
          className="flex flex-wrap items-end gap-3 rounded-xl border border-border p-4"
          aria-hidden
        >
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="ml-auto h-9 w-24 rounded-md" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" aria-hidden>
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="ml-auto h-9 w-28 rounded-md" />
        </div>
      )}
      <PortalTableBodySkeleton rows={rows} />
    </LoadingStatus>
  );
}
