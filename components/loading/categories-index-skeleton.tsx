import { LoadingStatus } from "@/components/loading/loading-status";
import { PageHeaderSkeleton } from "@/components/loading/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesIndexSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeaderSkeleton showEyebrow />
      <ul
        className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-hidden
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <li
            key={i}
            className="flex min-h-24 items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
          >
            <Skeleton className="size-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    </LoadingStatus>
  );
}
