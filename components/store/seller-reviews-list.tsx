import type { Review } from "@/lib/types";

type SellerReviewsListProps = {
  reviews: Review[];
  average: number | null;
};

function StarRow({ rating }: { rating: number }) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return (
    <p className="font-mono text-xs text-muted-foreground">
      <span aria-hidden className="text-accent">
        {filled}
        {empty}
      </span>{" "}
      <span>{rating}/5</span>
    </p>
  );
}

export function SellerReviewsList({ reviews, average }: SellerReviewsListProps) {
  return (
    <section aria-labelledby="seller-reviews-heading" className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="seller-reviews-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Seller reviews
        </h2>
        {average != null ? (
          <p className="font-mono text-xs text-muted-foreground">
            {average.toFixed(1)} avg · {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No approved reviews yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li
              key={review.$id}
              className="max-w-prose rounded-xl border border-border bg-card p-4"
            >
              <StarRow rating={review.rating} />
              {review.comment ? (
                <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
              ) : null}
              {review.$createdAt ? (
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {new Date(review.$createdAt).toLocaleDateString()}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
