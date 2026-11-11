"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

type ProductSearchFormProps = {
  className?: string;
};

export function ProductSearchForm({ className }: ProductSearchFormProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <form action="/search" method="get" className={className} role="search">
      <div className="relative flex w-full items-center rounded-full border border-border bg-muted/70 transition focus-within:border-accent focus-within:bg-background">
        <Search
          className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
          aria-hidden
        />
        <input
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search listings"
          maxLength={64}
          aria-label="Search products"
          className="h-10 w-full min-w-0 rounded-full bg-transparent pr-12 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:bg-accent-deep"
        >
          <Search className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
