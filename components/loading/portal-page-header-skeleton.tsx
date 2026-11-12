import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PortalPageHeaderSkeletonProps = {
  showAction?: boolean;
  className?: string;
};

export function PortalPageHeaderSkeleton({
  showAction = true,
  className,
}: PortalPageHeaderSkeletonProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      aria-hidden
    >
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {showAction ? (
        <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
      ) : null}
    </header>
  );
}
