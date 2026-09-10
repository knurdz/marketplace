import { CategoryRail } from "@/components/store/category-rail";
import { HowItWorksStrip } from "@/components/store/how-it-works-strip";
import { ProductGrid } from "@/components/store/product-grid";
import { PromoCarousel, type PromoSlide } from "@/components/store/promo-carousel";
import { SectionHeading } from "@/components/store/section-heading";
import { coverPreviewUrl, formatProductPrice } from "@/components/store/product-display";
import { Reveal } from "@/components/motion/reveal";
import {
  listCategories,
  listCoverImagesByProductIds,
  listFeaturedProducts,
  listTrendingProducts,
} from "@/lib/services";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

const PROMO_SLIDE_LIMIT = 5;

function buildPromoSlides(
  featured: Product[],
  covers: ProductCoverMap,
): PromoSlide[] {
  const slides = featured.slice(0, PROMO_SLIDE_LIMIT).map((product) => {
    const cover = covers[product.$id];
    return {
      id: product.$id,
      eyebrow: "Featured listing",
      title: product.title,
      detail: `${formatProductPrice(product)} · ${
        product.stock > 0 ? `${product.stock} in stock` : "Out of stock"
      }`,
      href: `/products/${product.$id}`,
      ctaLabel: "View listing",
      imageUrl: cover ? coverPreviewUrl(cover, 1200) : null,
    } satisfies PromoSlide;
  });

  if (slides.length > 0) return slides;

  return [
    {
      id: "browse-market",
      eyebrow: "Knurdz Marketplace",
      title: "Buy and sell what the community builds",
      detail:
        "Browse active listings from approved sellers. Pay with PayHere, bank transfer, cash on delivery, or free.",
      href: "/market",
      ctaLabel: "Browse market",
      imageUrl: null,
    },
  ];
}

export default async function Home() {
  const [categories, featured, trending] = await Promise.all([
    listCategories(),
    listFeaturedProducts({ limit: 12 }),
    listTrendingProducts({ limit: 8 }),
  ]);

  const covers = await listCoverImagesByProductIds([
    ...featured.map((product) => product.$id),
    ...trending.map((product) => product.$id),
  ]);

  const slides = buildPromoSlides(featured, covers);
  const featuredGrid = featured.slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PromoCarousel slides={slides} />

      {categories.length > 0 ? (
        <section className="mt-8">
          <SectionHeading
            title="Shop by category"
            href="/categories"
            linkLabel="All categories"
          />
          <CategoryRail categories={categories} className="mt-4" />
        </section>
      ) : null}

      {featuredGrid.length > 0 ? (
        <Reveal>
          <section className="mt-12">
            <SectionHeading
              title="Hand-picked"
              description="Listings the team is highlighting right now."
              href="/market"
              linkLabel="Browse market"
            />
            <ProductGrid
              products={featuredGrid}
              covers={covers}
              className="mt-5"
            />
          </section>
        </Reveal>
      ) : null}

      {trending.length > 0 ? (
        <Reveal>
          <section className="mt-12">
            <SectionHeading
              title="Moving now"
              description="Most viewed listings this week."
              href="/market"
              linkLabel="Browse market"
            />
            <ProductGrid products={trending} covers={covers} className="mt-5" />
          </section>
        </Reveal>
      ) : null}

      <section className="mt-14 mb-4">
        <SectionHeading title="How buying works" />
        <div className="mt-5">
          <HowItWorksStrip />
        </div>
      </section>
    </main>
  );
}
