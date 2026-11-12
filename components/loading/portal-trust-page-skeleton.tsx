import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { PortalTableBodySkeleton } from "@/components/loading/portal-table-body-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalTrustPageSkeleton() {
  return (
    <LoadingStatus className="w-full space-y-8">
      <PortalPageHeaderSkeleton showAction={false} />
      <Skeleton className="h-4 w-full max-w-lg" aria-hidden />
      <section className="space-y-3" aria-hidden>
        <Skeleton className="h-6 w-40" />
        <PortalTableBodySkeleton rows={5} />
      </section>
      <section className="space-y-3" aria-hidden>
        <Skeleton className="h-6 w-44" />
        <PortalTableBodySkeleton rows={5} />
      </section>
    </LoadingStatus>
  );
}
