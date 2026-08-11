import type { ProductCatalogParams } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <form
      action={action}
      method="get"
      className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {preserve &&
        Object.entries(preserve).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      <div className="flex min-w-[8rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="minPrice">Min price</Label>
        <Input
          id="minPrice"
          name="minPrice"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Any"
          defaultValue={
            defaults.minPrice != null ? String(defaults.minPrice) : ""
          }
          aria-label="Minimum price"
        />
      </div>

      <div className="flex min-w-[8rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="maxPrice">Max price</Label>
        <Input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Any"
          defaultValue={
            defaults.maxPrice != null ? String(defaults.maxPrice) : ""
          }
          aria-label="Maximum price"
        />
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="sort">Sort</Label>
        <select
          id="sort"
          name="sort"
          defaultValue={defaults.sort}
          aria-label="Sort products"
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="sm" className="sm:mb-0.5">
        Apply
      </Button>
    </form>
  );
}
