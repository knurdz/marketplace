import { LoadingStatus } from "@/components/loading/loading-status";
import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerListingEditLoading() {
  return (
    <LoadingStatus className="w-full max-w-2xl space-y-6">
      <PortalPageHeaderSkeleton showAction={false} />
      <div className="space-y-4" aria-hidden>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </LoadingStatus>
  );
}
