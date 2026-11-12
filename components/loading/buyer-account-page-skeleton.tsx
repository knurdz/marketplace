import { LoadingStatus } from "@/components/loading/loading-status";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BuyerAccountPageSkeletonProps = {
  variant?: "list" | "dashboard";
  showNav?: boolean;
};

export function BuyerAccountPageSkeleton({
  variant = "list",
  showNav = true,
}: BuyerAccountPageSkeletonProps) {
  return (
    <LoadingStatus
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div
        className={cn(
          "grid gap-8",
          showNav && "lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10",
        )}
      >
        {showNav ? (
          <aside className="hidden lg:block" aria-hidden>
            <Skeleton className="mb-2 h-3 w-16" />
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          <header
            className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            aria-hidden
          >
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
          </header>

          <div className="mt-8 space-y-6" aria-hidden>
            {variant === "dashboard" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                <section className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <ProductGridSkeleton count={4} />
                </section>
              </>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LoadingStatus>
  );
}
