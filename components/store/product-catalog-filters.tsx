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
      className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-3 sm:flex-row sm:flex-wrap sm:items-end"
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
        <Label htmlFor="maxPrice">Max</Label>
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
          className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit">Apply</Button>
    </form>
  );
}
