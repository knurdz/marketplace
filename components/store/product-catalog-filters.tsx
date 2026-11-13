"use client";

import { useState } from "react";
import type { ProductCatalogParams } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProductCatalogFiltersProps = {
  action: string;
  defaults: ProductCatalogParams;
  preserve?: Record<string, string>;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export function ProductCatalogFilters({
  action,
  defaults,
  preserve,
}: ProductCatalogFiltersProps) {
  const currentSort =
    SORT_OPTIONS.find((o) => o.value === defaults.sort) ?? SORT_OPTIONS[0];
  const [selectedSort, setSelectedSort] = useState(currentSort);

  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {preserve &&
        Object.entries(preserve).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      <div className="flex min-w-[8rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="minPrice">Min</Label>
        <Input
          id="minPrice"
          name="minPrice"
          type="number"
          min={0}
          step="1"
          inputMode="numeric"
          placeholder="Any"
          defaultValue={
            defaults.minPrice != null ? String(Math.round(defaults.minPrice)) : ""
          }
          aria-label="Minimum price"
        />
      </div>

      <div className="flex min-w-[8rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="maxPrice">Max</Label>
        <Input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min={0}
          step="1"
          inputMode="numeric"
          placeholder="Any"
          defaultValue={
            defaults.maxPrice != null ? String(Math.round(defaults.maxPrice)) : ""
          }
          aria-label="Maximum price"
        />
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label>Sort</Label>
        {/* Hidden input carries the value on form submit */}
        <input type="hidden" name="sort" value={selectedSort.value} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Sort products"
              className="border-input bg-background text-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span>{selectedSort.label}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[10rem]">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setSelectedSort(option)}
                className="flex items-center justify-between"
              >
                {option.label}
                {selectedSort.value === option.value && (
                  <Check className="size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button type="submit">Apply</Button>
    </form>
  );
}
