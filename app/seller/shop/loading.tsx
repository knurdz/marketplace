import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { LoadingStatus } from "@/components/loading/loading-status";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerShopLoading() {
  return (
    <LoadingStatus className="w-full max-w-2xl space-y-6">
      <PortalPageHeaderSkeleton />
      <div className="space-y-4" aria-hidden>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </LoadingStatus>
  );
}
