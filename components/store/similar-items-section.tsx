import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

type SimilarItemsSectionProps = {
  products: Product[];
  covers?: ProductCoverMap;
  categoryName?: string | null;
  categoryHref?: string | null;
};

export function SimilarItemsSection({
  products,
  covers,
  categoryName,
  categoryHref,
}: SimilarItemsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-14 w-full">
      <SectionHeading
        title="Similar items"
        description={
          categoryName
            ? `More available listings in ${categoryName}`
            : "More available listings in this category"
        }
        href={categoryHref ?? undefined}
        linkLabel="View category"
      />
      <div className="mt-6">
        <ProductGrid products={products} covers={covers} />
      </div>
    </section>
  );
}
