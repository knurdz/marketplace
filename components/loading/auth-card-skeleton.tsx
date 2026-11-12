import { LoadingStatus } from "@/components/loading/loading-status";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthCardSkeleton() {
  return (
    <LoadingStatus className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <Skeleton className="mx-auto h-8 w-48" aria-hidden />
      <div
        className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6"
        aria-hidden
      >
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="mt-2 h-10 w-full rounded-md" />
      </div>
    </LoadingStatus>
  );
}
