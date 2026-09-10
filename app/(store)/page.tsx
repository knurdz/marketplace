import { CategoryRail } from "@/components/store/category-rail";
import { HowItWorksStrip } from "@/components/store/how-it-works-strip";
import { ProductGrid } from "@/components/store/product-grid";
import { PromoCarousel, type PromoSlide } from "@/components/store/promo-carousel";
import { SectionHeading } from "@/components/store/section-heading";
import { coverPreviewUrl, formatProductPrice } from "@/components/store/product-display";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBanner } from "@/components/landing/marquee-banner";
import {
  AmbientMarketplaceGlow,
  FloatingMarketBadges,
} from "@/components/landing/floating-objects";
import { MarketStatsTicker } from "@/components/landing/market-stats-ticker";
import { CreatorCtaBanner } from "@/components/landing/creator-cta-banner";
import {
  listActiveProducts,
  listCategories,
  listCoverImagesByProductIds,
  listFeaturedProducts,
  listTrendingProducts,
} from "@/lib/services";
import type { ProductCoverMap } from "@/lib/services/products";
import type { Product } from "@/lib/types";

const PROMO_SLIDE_LIMIT = 8;

function buildPromoSlides(
  featured: Product[],
  trending: Product[],
  active: Product[],
  covers: ProductCoverMap,
): PromoSlide[] {
  // Combine featured + trending + active to ensure multiple cards move across
  const pool = [
    ...featured,
    ...trending.filter((t) => !featured.some((f) => f.$id === t.$id)),
    ...active.filter(
      (a) =>
        !featured.some((f) => f.$id === a.$id) &&
        !trending.some((t) => t.$id === a.$id),
    ),
  ];

  const slides = pool.slice(0, PROMO_SLIDE_LIMIT).map((product) => {
    const cover = covers[product.$id];
    return {
      id: product.$id,
      eyebrow: product.featured ? "Featured Drop" : "Trending on Market",
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
  const [categories, featured, trending, active] = await Promise.all([
    listCategories(),
    listFeaturedProducts({ limit: 12 }),
    listTrendingProducts({ limit: 8 }),
    listActiveProducts({ limit: 12 }),
  ]);

  const allProductIds = Array.from(
    new Set([
      ...featured.map((p) => p.$id),
      ...trending.map((p) => p.$id),
      ...active.map((p) => p.$id),
    ]),
  );

  const covers = await listCoverImagesByProductIds(allProductIds);

  const slides = buildPromoSlides(featured, trending, active, covers);
  const featuredGrid = featured.slice(0, 8);

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
      {/* Ambient glowing atmosphere to eliminate pitch-black void */}
      <AmbientMarketplaceGlow />

      {/* Moving continuous marquee banner (live ticker) */}
      <MarqueeBanner className="mb-2" />

      {/* Featured listings moving card carousel */}
      <section className="space-y-4">
        <PromoCarousel slides={slides} />
        {/* 3 static objects under featured listing horizontally aligned */}
        <div className="flex items-center px-1">
          <FloatingMarketBadges />
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 ? (
        <section className="pt-2">
          <SectionHeading
            title="Shop by category"
            href="/categories"
            linkLabel="All categories"
          />
          <CategoryRail categories={categories} className="mt-4" />
        </section>
      ) : null}

      {/* Live Marketplace Value / Stats Strip */}
      <section className="pt-2">
        <MarketStatsTicker />
      </section>

      {/* Hand-picked listings */}
      {featuredGrid.length > 0 ? (
        <Reveal>
          <section className="pt-2">
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

      {/* Moving now / Trending listings */}
      {trending.length > 0 ? (
        <Reveal>
          <section className="pt-2">
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

      {/* Creator & Seller Community Callout Banner */}
      <Reveal>
        <section className="pt-2">
          <CreatorCtaBanner />
        </section>
      </Reveal>

      {/* How buying works */}
      <section className="pt-2 pb-6">
        <SectionHeading title="How buying works" />
        <div className="mt-5">
          <HowItWorksStrip />
        </div>
      </section>
    </main>
  );
}
