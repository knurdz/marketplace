import { Skeleton } from "@/components/ui/skeleton";

type PortalTableBodySkeletonProps = {
  rows?: number;
};

export function PortalTableBodySkeleton({ rows = 6 }: PortalTableBodySkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border" aria-hidden>
      <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="ml-auto h-4 w-12" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
