import { Star } from "lucide-react";

export function ShowcaseSellerRating({
  name,
  rating,
  reviews,
}: {
  name: string;
  rating: number;
  reviews: number;
}) {
  const filled = Math.round(rating);

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        Listed by{" "}
        <span className="font-medium text-foreground">{name}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex" aria-label={`Seller rated ${rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={
                i < filled
                  ? "size-4 fill-amber-400 text-amber-400"
                  : "size-4 fill-muted text-muted-foreground/40"
              }
              aria-hidden
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} · {reviews} seller {reviews === 1 ? "rating" : "ratings"}
        </span>
      </div>
    </div>
  );
}
