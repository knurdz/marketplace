import { LoadingStatus } from "@/components/loading/loading-status";
import { PageHeaderSkeleton } from "@/components/loading/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerPendingSkeleton() {
  return (
    <LoadingStatus className="mx-auto max-w-xl">
      <PageHeaderSkeleton showEyebrow showAction={false} />
      <div
        className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6"
        aria-hidden
      >
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-4 h-10 w-full rounded-md" />
      </div>
    </LoadingStatus>
  );
}
