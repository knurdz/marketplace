import { LoadingStatus } from "@/components/loading/loading-status";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const RAIL_KEYS = [
  "rail-all",
  "rail-a",
  "rail-b",
  "rail-c",
  "rail-d",
  "rail-e",
] as const;

export function CatalogPageSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section
        className="mx-auto max-w-2xl space-y-2 text-center"
        aria-hidden
      >
        <Skeleton className="mx-auto h-9 w-40 sm:h-10" />
        <Skeleton className="mx-auto h-5 w-56" />
      </section>

      <div className="space-y-5" aria-hidden>
        <div className="flex gap-2 overflow-hidden">
          {RAIL_KEYS.map((key) => (
            <Skeleton key={key} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </LoadingStatus>
  );
}
