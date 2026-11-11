"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createSellerReview } from "@/lib/services/review-actions";
import type { Review, ReviewStatus } from "@/lib/types";
import { toast } from "@/lib/ui/toast";

type SellerReviewFormProps = {
  requestId: string;
  canReview: boolean;
  existing?: Review | null;
  existingStatus?: ReviewStatus;
};

function StarRow({ rating }: { rating: number }) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return (
    <p className="font-mono text-sm text-muted-foreground">
      <span aria-hidden className="text-accent">
        {filled}
        {empty}
      </span>{" "}
      <span>{rating}/5</span>
    </p>
  );
}

export function SellerReviewForm({
  requestId,
  canReview,
  existing,
  existingStatus,
}: SellerReviewFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const status = existing?.status ?? existingStatus;

  if (existing || status) {
    const label =
      status === "approved"
        ? "Your review is live on the seller’s shop."
        : status === "rejected"
          ? "An admin did not approve your review."
          : "Your review is waiting for admin approval.";
    return (
      <section
        className="rounded-xl border border-border bg-card p-4"
        data-testid="seller-review-status"
      >
        <h2 className="text-sm font-semibold tracking-tight">Seller review</h2>
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
        {existing ? (
          <div className="mt-3 space-y-2">
            <StarRow rating={existing.rating} />
            {existing.comment ? (
              <p className="text-sm leading-relaxed">{existing.comment}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  if (!canReview) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }

    startTransition(async () => {
      const result = await createSellerReview({
        requestId,
        rating,
        comment: comment.trim() || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Review submitted.");
      setRating(null);
      setComment("");
      router.refresh();
    });
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-4"
      data-testid="seller-review-form"
    >
      <h2 className="text-sm font-semibold tracking-tight">Rate this seller</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Reviews are about the seller. An admin must approve before it appears on
        their shop.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm text-muted-foreground">Rating</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={rating === value ? "default" : "outline"}
                aria-pressed={rating === value}
                aria-label={`Rating ${value} out of 5`}
                onClick={() => setRating(value)}
                data-testid={`seller-review-rating-${value}`}
              >
                {value}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <label
            htmlFor="seller-review-comment"
            className="block text-sm text-muted-foreground"
          >
            Comment (optional)
          </label>
          <textarea
            id="seller-review-comment"
            name="comment"
            rows={4}
            maxLength={2000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-accent focus:ring-2"
            data-testid="seller-review-comment"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={pending || !rating}
          data-testid="seller-review-submit"
        >
          {pending ? "Submitting…" : "Submit review"}
        </Button>
      </form>
    </section>
  );
}
