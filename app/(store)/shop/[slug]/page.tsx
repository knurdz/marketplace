import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { SellerPolicyBlocks } from "@/components/store/seller-policy-blocks";
import { SellerReviewsList } from "@/components/store/seller-reviews-list";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { getShopBannerPreviewUrl } from "@/lib/appwrite/storage-urls";
import {
  getPublicSellerBySlug,
  getSellerRatingSummary,
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

  const [products, reviews, ratingSummary] = await Promise.all([
    listActiveProducts({
      sellerId: seller.userId,
      limit: 48,
    }),
    listApprovedSellerReviews(seller.userId),
    getSellerRatingSummary(seller.userId),
  ]);
  const covers = await listCoverImagesByProductIds(products.map((p) => p.$id));
  const bannerUrl = getShopBannerPreviewUrl(seller.bannerFileId);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Appwrite Storage URL
        <img
          src={bannerUrl}
          alt=""
          className="mb-8 h-44 w-full rounded-xl border border-border object-cover sm:h-56"
        />
      ) : null}

      <PageHeader
        eyebrow={`@${seller.slug}`}
        title={seller.shopName}
        description={seller.bio ?? undefined}
      />
      {ratingSummary.count > 0 && ratingSummary.average != null ? (
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          {ratingSummary.average.toFixed(1)} avg · {ratingSummary.count}{" "}
          seller {ratingSummary.count === 1 ? "rating" : "ratings"}
        </p>
      ) : null}
      <SellerPolicyBlocks seller={seller} className="mt-8" />

      <section aria-labelledby="shop-listings-heading" className="mt-12">
        <h2 id="shop-listings-heading" className="text-lg font-semibold tracking-tight">
          Listings
        </h2>
        {products.length > 0 ? (
          <div className="mt-6">
            <ProductGrid products={products} covers={covers} />
          </div>
        ) : (
          <EmptyState
            className="mt-6"
            title="No active listings yet"
            description="This shop has not published anything public."
          />
        )}
      </section>

      <SellerReviewsList
        reviews={reviews}
        average={ratingSummary.average}
      />
    </main>
  );
}
