import { LoadingStatus } from "@/components/loading/loading-status";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_CIRCLE_KEYS = [
  "cat-a",
  "cat-b",
  "cat-c",
  "cat-d",
  "cat-e",
  "cat-f",
  "cat-g",
  "cat-h",
] as const;

export function StoreHomeSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="mx-auto max-w-2xl space-y-2 text-center" aria-hidden>
        <Skeleton className="mx-auto h-9 w-56 sm:h-10" />
        <Skeleton className="mx-auto h-5 w-full max-w-md" />
      </section>

      <div id="browse" className="scroll-mt-24 space-y-10" aria-hidden>
        <div className="flex gap-3 overflow-hidden pb-1">
          {CATEGORY_CIRCLE_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 w-20 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="ml-auto h-9 w-32 rounded-md" />
        </div>
      </div>

      <section className="space-y-5" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <ProductGridSkeleton count={4} />
      </section>

      <section className="space-y-5 pb-6" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <ProductGridSkeleton count={8} />
      </section>
    </LoadingStatus>
  );
}
