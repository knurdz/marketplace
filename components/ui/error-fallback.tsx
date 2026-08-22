"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type ErrorFallbackProps = {
  reset: () => void;
  title?: string;
};

/**
 * Shared error UI for App Router error.tsx boundaries.
 * Does not render raw error.message (may leak internals).
 */
export function ErrorFallback({
  reset,
  title = "Something went wrong",
}: ErrorFallbackProps) {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        An unexpected error occurred. You can try again or return to the
        storefront.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
