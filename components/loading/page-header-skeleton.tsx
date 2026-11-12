import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageHeaderSkeletonProps = {
  centered?: boolean;
  showEyebrow?: boolean;
  showAction?: boolean;
  className?: string;
};

export function PageHeaderSkeleton({
  centered = false,
  showEyebrow = false,
  showAction = true,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <header
      className={cn(
        centered
          ? "mx-auto max-w-2xl space-y-2 text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "min-w-0 max-w-2xl space-y-2",
          centered && "mx-auto flex flex-col items-center",
        )}
      >
        {showEyebrow ? (
          <Skeleton className="h-4 w-20" />
        ) : null}
        <Skeleton
          className={cn(
            "h-9 w-48 sm:h-11",
            centered && "mx-auto",
          )}
        />
        <Skeleton
          className={cn(
            "h-5 w-full max-w-md",
            centered && "mx-auto",
          )}
        />
      </div>
      {showAction && !centered ? (
        <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
      ) : null}
    </header>
  );
}
