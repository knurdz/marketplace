import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalRequestDetailSkeleton() {
  return (
    <LoadingStatus className="w-full space-y-6">
      <PortalPageHeaderSkeleton />
      <div
        className="overflow-hidden rounded-xl border border-border bg-card"
        aria-hidden
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <aside className="border-b border-border bg-muted/15 p-5 lg:border-b-0 lg:border-r">
            <Skeleton className="mx-auto aspect-square w-full max-w-[240px] rounded-lg lg:max-w-none" />
            <div className="mt-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="mt-5 h-9 w-full rounded-md" />
          </aside>
          <div className="space-y-4 p-5 lg:p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </LoadingStatus>
  );
}
