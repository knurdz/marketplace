import { LoadingStatus } from "@/components/loading/loading-status";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopPageSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4" aria-hidden>
        <Skeleton className="h-36 w-full rounded-xl sm:h-44" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <section className="mt-10" aria-hidden>
        <Skeleton className="h-6 w-24" />
        <div className="mt-6">
          <ProductGridSkeleton count={6} className="lg:grid-cols-3" />
        </div>
      </section>
    </LoadingStatus>
  );
}
