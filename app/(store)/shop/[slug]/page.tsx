import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfiniteProductGrid } from "@/components/store/infinite-product-grid";
import { SellerPolicyBlocks } from "@/components/store/seller-policy-blocks";
import { ShopHeader } from "@/components/store/shop-header";
import { EmptyState } from "@/components/layout/empty-state";
import { getShopBannerPreviewUrl } from "@/lib/backend/storage-urls";
import { buildNoIndexMetadata, buildPublicMetadata } from "@/lib/seo/metadata";
import {
  computeSellerReviewMetrics,
  getPublicSellerBySlug,
  listActiveProductsPage,
  listApprovedSellerReviews,
  listCoverImagesByProductIds,
  recordMarketplaceView,
} from "@/lib/services";
import { CATALOG_PAGE_SIZE } from "@/lib/services/products";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const seller = await getPublicSellerBySlug(slug);
  if (!seller) {
    return buildNoIndexMetadata("Shop not found");
  }

  const bannerUrl = getShopBannerPreviewUrl(seller.bannerFileId);
  const description =
    seller.bio?.trim() ||
    `Browse active listings from ${seller.shopName} on Knurdz Marketplace. Buy directly from the seller with zero platform fees.`;

  return buildPublicMetadata({
    title: seller.shopName,
    description,
    canonicalPath: `/shop/${seller.slug}`,
    image: bannerUrl
      ? {
          url: bannerUrl,
          alt: `${seller.shopName} shop banner`,
          width: 1200,
          height: 320,
        }
      : null,
  });
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const seller = await getPublicSellerBySlug(slug);
  if (!seller) notFound();

  await recordMarketplaceView({
    sellerId: seller.userId,
    kind: "shop",
    targetId: seller.userId,
  });

  const [catalogPage, reviews] = await Promise.all([
    listActiveProductsPage({
      sellerId: seller.userId,
      limit: CATALOG_PAGE_SIZE,
    }),
    listApprovedSellerReviews(seller.userId),
  ]);
  const products = catalogPage.products;
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));
  const bannerUrl = getShopBannerPreviewUrl(seller.bannerFileId);
  const metrics = computeSellerReviewMetrics(reviews);
  const hasAbout = Boolean(
    seller.bio || seller.returnPolicy || seller.shippingPolicy,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ShopHeader
        seller={seller}
        bannerUrl={bannerUrl}
        listingCount={catalogPage.total}
        metrics={metrics}
        reviews={reviews}
      />

      <div
        className={
          hasAbout
            ? "mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:items-start"
            : "mt-10"
        }
      >
        <section aria-labelledby="shop-listings-heading">
          <h2
            id="shop-listings-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Listings
          </h2>
          {products.length > 0 ? (
            <div className="mt-6">
              <InfiniteProductGrid
                initialProducts={products}
                initialCovers={covers}
                totalCount={catalogPage.total}
                source="catalog"
                sellerId={seller.userId}
                sort="newest"
                initialCursor={catalogPage.nextCursor}
                gridClassName={hasAbout ? "lg:grid-cols-3" : undefined}
              />
            </div>
          ) : (
            <EmptyState
              className="mt-6"
              title="No active listings yet"
              description="This shop has not published anything public."
            />
          )}
        </section>

        {hasAbout ? (
          <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
            {seller.bio ? (
              <section aria-labelledby="shop-about-heading">
                <h2
                  id="shop-about-heading"
                  className="text-sm font-semibold tracking-tight text-foreground"
                >
                  About
                </h2>
                <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {seller.bio}
                </p>
              </section>
            ) : null}
            <SellerPolicyBlocks
              seller={seller}
              className={seller.bio ? "mt-6 border-t border-border pt-6" : undefined}
            />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
