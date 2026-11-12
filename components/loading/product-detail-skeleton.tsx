import { LoadingStatus } from "@/components/loading/loading-status";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2" aria-hidden>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div
        className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14"
        aria-hidden
      >
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </LoadingStatus>
  );
}
