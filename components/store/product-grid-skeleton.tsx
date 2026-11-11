import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function ProductGridSkeleton({
  count = 4,
  className,
}: ProductGridSkeletonProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-2/5" />
        </li>
      ))}
    </ul>
  );
}
