import { LoadingStatus } from "@/components/loading/loading-status";
import { Skeleton } from "@/components/ui/skeleton";

export function BuyerRequestDetailSkeleton() {
  return (
    <LoadingStatus
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="grid gap-8 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-hidden>
          <Skeleton className="mb-2 h-3 w-16" />
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <header
            className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            aria-hidden
          >
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-36 shrink-0 rounded-md" />
          </header>

          <div
            className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card"
            aria-hidden
          >
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
              <aside className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                <Skeleton className="mx-auto aspect-square w-full max-w-[240px] rounded-xl lg:max-w-none" />
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
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadingStatus>
  );
}
