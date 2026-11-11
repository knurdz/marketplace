import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { SellerPolicyBlocks } from "@/components/store/seller-policy-blocks";
import { ShopHeader } from "@/components/store/shop-header";
import { EmptyState } from "@/components/layout/empty-state";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import {
  computeSellerReviewMetrics,
  getPublicSellerBySlug,
  listActiveProducts,
  listApprovedSellerReviews,
  listCoverImagesByProductIds,
  recordMarketplaceView,
} from "@/lib/services";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const seller = await getPublicSellerBySlug(slug);
  if (!seller) notFound();

  await recordMarketplaceView({
    sellerId: seller.userId,
    kind: "shop",
    targetId: seller.userId,
  });

  const [products, reviews] = await Promise.all([
    listActiveProducts({
      sellerId: seller.userId,
      limit: 48,
    }),
    listApprovedSellerReviews(seller.userId),
  ]);
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
        listingCount={products.length}
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
              <ProductGrid
                products={products}
                covers={covers}
                className={hasAbout ? "lg:grid-cols-3" : undefined}
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
