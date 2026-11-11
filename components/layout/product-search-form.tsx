"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Search, Store, Tag } from "lucide-react";
import type { SearchSuggestionIndex } from "@/lib/services/products";
import { cn } from "@/lib/utils";

type ProductSearchFormProps = {
  className?: string;
};

type Suggestion =
  | { kind: "product"; id: string; label: string; href: string }
  | { kind: "category"; label: string; href: string }
  | { kind: "shop"; label: string; href: string };

const MAX_SUGGESTIONS = 8;
const MIN_QUERY_CHARS = 2;

let indexPromise: Promise<SearchSuggestionIndex | null> | null = null;

function loadSuggestionIndex(): Promise<SearchSuggestionIndex | null> {
  if (!indexPromise) {
    indexPromise = fetch("/api/search-suggestions")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`suggestion index ${res.status}`);
        }
        const data = (await res.json()) as SearchSuggestionIndex;
        if (
          !data ||
          !Array.isArray(data.products) ||
          !Array.isArray(data.categories) ||
          !Array.isArray(data.shops)
        ) {
          throw new Error("suggestion index shape invalid");
        }
        return data;
      })
      .catch(() => {
        // Allow a later focus/type to retry after a transient failure.
        indexPromise = null;
        return null;
      });
  }
  return indexPromise;
}

function searchHref(label: string): string {
  return `/search?q=${encodeURIComponent(label)}`;
}

/** Pure local filter for the cached index (no server). Exported for verify scripts. */
export function filterSearchSuggestions(
  index: SearchSuggestionIndex,
  rawQuery: string,
  limit = MAX_SUGGESTIONS,
): Suggestion[] {
  const needle = rawQuery.trim().toLowerCase();
  if (needle.length < MIN_QUERY_CHARS) return [];

  const out: Suggestion[] = [];

  for (const product of index.products) {
    if (out.length >= limit) break;
    if (product.title.toLowerCase().includes(needle)) {
      out.push({
        kind: "product",
        id: product.id,
        label: product.title,
        href: `/products/${product.id}`,
      });
    }
  }

  for (const name of index.categories) {
    if (out.length >= limit) break;
    if (name.toLowerCase().includes(needle)) {
      out.push({
        kind: "category",
        label: name,
        href: searchHref(name),
      });
    }
  }

  for (const name of index.shops) {
    if (out.length >= limit) break;
    if (name.toLowerCase().includes(needle)) {
      out.push({
        kind: "shop",
        label: name,
        href: searchHref(name),
      });
    }
  }

  return out;
}

export function ProductSearchForm({ className }: ProductSearchFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQ = searchParams.get("q") ?? "";
  const listboxId = useId();

  const [value, setValue] = useState(urlQ);
  const [index, setIndex] = useState<SearchSuggestionIndex | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  const ensureIndex = useCallback(() => {
    void loadSuggestionIndex().then((data) => {
      if (data) setIndex(data);
    });
  }, []);

  const suggestions = useMemo(
    () => (index ? filterSearchSuggestions(index, value) : []),
    [index, value],
  );

  const showList = open && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  const clearBlurTimer = () => {
    if (blurCloseTimer.current) {
      clearTimeout(blurCloseTimer.current);
      blurCloseTimer.current = null;
    }
  };

  const navigateSuggestion = (suggestion: Suggestion) => {
    setOpen(false);
    setValue(suggestion.kind === "product" ? suggestion.label : suggestion.label);
    router.push(suggestion.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) navigateSuggestion(selected);
    }
  };

  return (
    <form
      action="/search"
      method="get"
      className={cn("relative", className)}
      role="search"
      onSubmit={() => setOpen(false)}
    >
      <div className="relative flex w-full items-center rounded-full border border-border bg-muted/70 transition focus-within:border-accent focus-within:bg-background">
        <Search
          className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            ensureIndex();
            setOpen(true);
          }}
          onFocus={() => {
            clearBlurTimer();
            ensureIndex();
            setOpen(true);
          }}
          onBlur={() => {
            blurCloseTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search listings"
          maxLength={64}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showList}
          autoComplete="off"
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

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-background py-1 shadow-lg"
        >
          {suggestions.map((suggestion, i) => {
            const active = i === activeIndex;
            const optionId = `${listboxId}-opt-${i}`;
            return (
              <li key={`${suggestion.kind}-${suggestion.label}-${i}`} role="presentation">
                <Link
                  id={optionId}
                  role="option"
                  aria-selected={active}
                  href={suggestion.href}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-2 px-3 py-2 text-sm transition",
                    active
                      ? "bg-accent/15 text-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {suggestion.kind === "product" ? (
                    <Search
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  ) : suggestion.kind === "category" ? (
                    <Tag
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  ) : (
                    <Store
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {suggestion.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {suggestion.kind === "product"
                        ? "Listing"
                        : suggestion.kind === "category"
                          ? "Category"
                          : "Shop"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}
