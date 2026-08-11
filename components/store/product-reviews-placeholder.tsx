export function ProductReviewsPlaceholder() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="border-t border-border pt-10"
    >
      <h2
        id="reviews-heading"
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        Reviews
      </h2>
      <p className="mt-4 max-w-prose text-sm text-muted-foreground">
        Reviews and ratings will appear here after buyers complete their orders.
        You can leave a review once your order is marked completed.
      </p>
    </section>
  );
}
