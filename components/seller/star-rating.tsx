import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  className,
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const iconClass = size === "md" ? "size-4" : "size-3.5";

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
        {Array.from({ length: max }, (_, index) => {
          const filled = index < rating;
          return (
            <Star
              key={index}
              className={cn(
                iconClass,
                filled
                  ? "fill-accent text-accent"
                  : "fill-muted/30 text-muted-foreground/40",
              )}
              aria-hidden
            />
          );
        })}
      </div>
      {showValue ? (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {rating}/{max}
        </span>
      ) : null}
    </div>
  );
}
