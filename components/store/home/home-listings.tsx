import { HorizontalFadeScroll } from "@/components/store/horizontal-fade-scroll";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

export function HomeListings({
  products,
  covers,
}: {
  products: Product[];
  covers?: ProductCoverMap;
}) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionHeading title="Just listed" />
      <HorizontalFadeScroll trackClassName="overscroll-x-contain py-1 pr-8">
        <ul className="flex w-max min-w-full snap-x snap-mandatory gap-4 sm:gap-5">
          {products.map((product) => (
          <ProductCard
            key={product.$id}
            product={product}
            cover={covers?.[product.$id]}
            className="w-40 shrink-0 snap-start sm:w-44 lg:w-48"
          />
          ))}
        </ul>
      </HorizontalFadeScroll>
    </section>
  );
}
