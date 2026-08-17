"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createProductReview } from "@/lib/services/review-actions";
import type { Review } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

type ProductReviewsPlaceholderProps = {
  productId: string;
  reviews: Review[];
  canReview: boolean;
  isLoggedIn: boolean;
  loginHref: string;
};

function StarRow({ rating, label }: { rating: number; label: string }) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return (
    <p className="font-mono text-xs text-muted-foreground">
      <span className="sr-only">{label}: </span>
      <span aria-hidden className="text-accent">
        {filled}
        {empty}
      </span>{" "}
      <span>{rating}/5</span>
    </p>
  );
}

function RatingPicker({
  id,
  label,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (next: number | null) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Button
            key={rating}
            type="button"
            size="sm"
            variant={value === rating ? "default" : "outline"}
            aria-pressed={value === rating}
            aria-label={`${label}: ${rating} out of 5`}
            onClick={() => onChange(required ? rating : value === rating ? null : rating)}
          >
            {rating}
          </Button>
        ))}
      </div>
      <input
        type="hidden"
        id={id}
        name={id}
        value={value ?? ""}
        required={required}
        readOnly
      />
    </fieldset>
  );
}

export function ProductReviewsPlaceholder({
  productId,
  reviews,
  canReview,
  isLoggedIn,
  loginHref,
}: ProductReviewsPlaceholderProps) {
  const [productRating, setProductRating] = useState<number | null>(null);
  const [sellerRating, setSellerRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productRating) {
      toast.error("Please select a product rating.");
      return;
    }

    startTransition(async () => {
      const result = await createProductReview({
        productId,
        productRating,
        sellerRating,
        comment: comment.trim() || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Review submitted.");
      setSubmitted(true);
      setProductRating(null);
      setSellerRating(null);
      setComment("");
      router.refresh();
    });
  }

  const averageProductRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.productRating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="border-t border-border pt-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="reviews-heading"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          Reviews
        </h2>
        {averageProductRating ? (
          <p className="font-mono text-xs text-muted-foreground">
            {averageProductRating} avg · {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          No reviews yet. Be the first after you complete an order.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li key={review.$id} className="max-w-prose">
              <StarRow rating={review.productRating} label="Product rating" />
              {review.sellerRating != null ? (
                <StarRow rating={review.sellerRating} label="Seller rating" />
              ) : null}
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

      <div className="mt-10 max-w-prose">
        {!isLoggedIn ? (
          <p className="text-sm text-muted-foreground">
            <Link href={loginHref} className="text-accent underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to leave a review after your order is completed.
          </p>
        ) : submitted ? (
          <p className="text-sm text-muted-foreground">
            Thanks — your review was submitted.
          </p>
        ) : canReview ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Share your experience from a completed order.
            </p>
            <RatingPicker
              id="productRating"
              label="Product rating"
              value={productRating}
              onChange={setProductRating}
              required
            />
            <RatingPicker
              id="sellerRating"
              label="Seller rating (optional)"
              value={sellerRating}
              onChange={setSellerRating}
            />
            <div className="space-y-2">
              <label htmlFor="review-comment" className="block text-sm text-muted-foreground">
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                name="comment"
                rows={4}
                maxLength={2000}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-accent focus:ring-2"
              />
            </div>
            <Button type="submit" size="sm" disabled={pending || !productRating}>
              {pending ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            You can leave a review once you have a completed order for this product.
          </p>
        )}
      </div>
    </section>
  );
}
