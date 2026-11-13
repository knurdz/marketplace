import Link from "next/link";
import type { ProductCatalogSort } from "@/lib/services/products";
import { cn } from "@/lib/utils";

type MarketFiltersProps = {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort: ProductCatalogSort;
  invalidPriceRange?: boolean;
};

const SORT_OPTIONS: { value: ProductCatalogSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

function buildMarketHref(params: {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: ProductCatalogSort;
}): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort);
  const qs = query.toString();
  return qs ? `/?${qs}#browse` : "/#browse";
}

export function MarketFilters({
  category,
  minPrice,
  maxPrice,
  sort,
  invalidPriceRange = false,
}: MarketFiltersProps) {
  const hasPriceFilter = minPrice != null || maxPrice != null;
  const clearHref = buildMarketHref({ category, sort });

  return (
    <div className="space-y-4">
      <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Sort listings"
          className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/40 p-1"
        >
          {SORT_OPTIONS.map((option) => {
            const active = sort === option.value;
            return (
              <Link
                key={option.value}
                href={buildMarketHref({
                  category,
                  minPrice,
                  maxPrice,
                  sort: option.value,
                })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        <form
          action="/"
          method="get"
          className="flex w-full min-w-0 max-md:flex-col max-md:gap-3 md:w-auto md:flex-row md:flex-nowrap md:items-center md:gap-2"
        >
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          {sort !== "newest" ? (
            <input type="hidden" name="sort" value={sort} />
          ) : null}

          <div className="flex w-full min-w-0 max-md:w-full items-center gap-2 md:w-auto md:shrink-0">
            <label
              htmlFor="market-minPrice"
              className="flex h-10 min-w-0 max-md:flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 focus-within:border-accent md:flex-none md:gap-2 md:px-3"
            >
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                Min
              </span>
              <span
                className="hidden shrink-0 text-xs text-muted-foreground md:inline"
                aria-hidden
              >
                LKR
              </span>
              <input
                id="market-minPrice"
                name="minPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                defaultValue={minPrice != null ? String(minPrice) : ""}
                className="min-w-0 max-md:flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground/70 md:w-20 md:flex-none"
              />
            </label>

            <span
              className="shrink-0 text-sm text-muted-foreground"
              aria-hidden
            >
              to
            </span>

            <label
              htmlFor="market-maxPrice"
              className="flex h-10 min-w-0 max-md:flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 focus-within:border-accent md:flex-none md:gap-2 md:px-3"
            >
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                Max
              </span>
              <span
                className="hidden shrink-0 text-xs text-muted-foreground md:inline"
                aria-hidden
              >
                LKR
              </span>
              <input
                id="market-maxPrice"
                name="maxPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Any"
                defaultValue={maxPrice != null ? String(maxPrice) : ""}
                className="min-w-0 max-md:flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground/70 md:w-20 md:flex-none"
              />
            </label>
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 max-md:w-full md:w-auto">
            <button
              type="submit"
              className="h-10 max-md:flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent-deep md:flex-none"
            >
              Filter
            </button>

            {hasPriceFilter ? (
              <Link
                href={clearHref}
                className="h-10 shrink-0 px-2 text-sm font-medium leading-10 text-muted-foreground transition hover:text-foreground"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      {invalidPriceRange ? (
        <p className="text-sm text-destructive">
          Minimum price cannot be greater than maximum.
        </p>
      ) : null}
    </div>
  );
}
