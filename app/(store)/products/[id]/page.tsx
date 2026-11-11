import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BuyRequestButton } from "@/components/store/buy-request-button";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { RecordRecentlyViewed } from "@/components/store/record-recently-viewed";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { ReportListingButton } from "@/components/store/report-listing-button";
import { SimilarItemsSection } from "@/components/store/similar-items-section";
import { WishlistToggleButton } from "@/components/store/wishlist-toggle-button";
import { StarRating } from "@/components/seller/star-rating";
import { formatProductPrice } from "@/components/store/product-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/backend/config";
import { getOwnProfile } from "@/lib/backend/profiles";
import { mayBrowsePublicCatalog } from "@/lib/backend/roles";
import { getLoggedInUser } from "@/lib/backend/session";
import { getFilePreviewUrl } from "@/lib/backend/storage-urls";
import { buildNoIndexMetadata, buildPublicMetadata } from "@/lib/seo/metadata";
import {
  getProduct,
  getPublicSellerByUserId,
  getSellerPhoneForBuy,
  getSellerRatingSummary,
  isProductInOwnWishlist,
  isProductPurchasable,
  listActiveProducts,
  listCategories,
  listCoverImagesByProductIds,
  listProductImages,
  recordMarketplaceView,
} from "@/lib/services";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return buildNoIndexMetadata("Listing not found");
  }

  const [images, seller] = await Promise.all([
    listProductImages(product.$id),
    getPublicSellerByUserId(product.sellerId),
  ]);

  const priceLabel = formatProductPrice(product);
  const coverImage = images[0];
  const coverUrl = coverImage
    ? getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, coverImage.fileId, {
        width: 1200,
        height: 630,
      })
    : null;
  const sellerSuffix = seller ? ` Listed by ${seller.shopName}.` : "";
  const description = product.description?.trim()
    ? `${product.description.trim()}${sellerSuffix}`
    : `${product.title} (${priceLabel}) on Knurdz Marketplace.${sellerSuffix}`;

  return buildPublicMetadata({
    title: `${product.title} — ${priceLabel}`,
    description,
    canonicalPath: `/products/${product.$id}`,
    image: coverUrl
      ? {
          url: coverUrl,
          alt: coverImage.alt || product.title,
        }
      : null,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, user, categories] = await Promise.all([
    getProduct(id),
    getLoggedInUser(),
    listCategories(),
  ]);
  if (!product) notFound();

  await recordMarketplaceView({
    sellerId: product.sellerId,
    kind: "product",
    targetId: product.$id,
  });

  const [
    images,
    seller,
    saved,
    profile,
    sellerPhone,
    sellerRating,
    categoryProducts,
  ] = await Promise.all([
    listProductImages(product.$id),
    getPublicSellerByUserId(product.sellerId),
    user ? isProductInOwnWishlist(product.$id) : Promise.resolve(false),
    user ? getOwnProfile() : Promise.resolve(null),
    getSellerPhoneForBuy(product.sellerId),
    getSellerRatingSummary(product.sellerId),
    listActiveProducts({
      categoryId: product.categoryId,
      limit: 12,
    }),
  ]);
  const similarProducts = categoryProducts
    .filter((entry) => entry.$id !== product.$id)
    .slice(0, 8);
  const similarCovers = await listCoverImagesByProductIds(
    similarProducts.map((entry) => entry.$id),
  );

  const category = categories.find((entry) => entry.$id === product.categoryId);
  const priceLabel = formatProductPrice(product);
  const isPortalBrowser = Boolean(user && mayBrowsePublicCatalog(user));
  const canBuy = isProductPurchasable(product) && !isPortalBrowser;
  const loginHref = `/login?next=${encodeURIComponent(`/products/${product.$id}`)}`;
  const buyerHasPhone = Boolean(profile?.phone);
  const sellerHasPhone = Boolean(sellerPhone);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RecordRecentlyViewed productId={product.$id} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/#browse">Browse</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/categories/${category.slug}`}>{category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
        <ProductImageGallery images={images} productTitle={product.title} />

        <div className="lg:sticky lg:top-24">
          {product.featured ? (
            <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-accent uppercase">
              Featured
            </span>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            {seller ? (
              <p>
                Listed by{" "}
                <Link
                  href={`/shop/${seller.slug}`}
                  className="font-medium text-foreground hover:text-accent"
                >
                  {seller.shopName}
                </Link>
              </p>
            ) : (
              <p>Seller unavailable</p>
            )}
            {sellerRating.count > 0 && sellerRating.average != null ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium tabular-nums text-foreground">
                  {sellerRating.average.toFixed(1)}
                </span>
                <StarRating rating={Math.round(sellerRating.average)} />
                <span className="text-xs">
                  ({sellerRating.count})
                </span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                No ratings yet
              </span>
            )}
          </div>

          {/* Price & Stock status aligned together */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {priceLabel}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium",
                product.stock > 0
                  ? "border border-accent/30 bg-accent/10 text-accent"
                  : "border border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  product.stock > 0 ? "bg-accent" : "bg-destructive",
                )}
              />
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            {isPortalBrowser ? (
              <p className="text-sm text-muted-foreground">
                Signed in as{" "}
                {user && user.labels.includes("admin") ? "admin" : "seller"}.
                Browse only — buy requests stay with buyer accounts.
              </p>
            ) : canBuy ? (
              <BuyRequestButton
                productId={product.$id}
                maxStock={product.stock}
                isLoggedIn={Boolean(user)}
                loginHref={loginHref}
                buyerHasPhone={buyerHasPhone}
                sellerHasPhone={sellerHasPhone}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {!product.available
                  ? "This person is not offering this right now."
                  : "They do not have any left. Check back later."}
              </p>
            )}

            {!isPortalBrowser ? (
              <WishlistToggleButton
                productId={product.$id}
                initialSaved={saved}
                isLoggedIn={Boolean(user)}
                loginHref={loginHref}
              />
            ) : null}
          </div>

          {/* Product Description */}
          <section aria-labelledby="description-heading" className="mt-8 border-t border-border pt-6">
            <h2 id="description-heading" className="text-sm font-semibold tracking-tight text-foreground">
              Description
            </h2>
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </section>

          {/* Metadata Bar & Report Listing Action */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <span>
              Bought from a person. No store markup.
            </span>
            <ReportListingButton
              productId={product.$id}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to listings
          </Link>
        </Button>
      </div>

      <SimilarItemsSection
        products={similarProducts}
        covers={similarCovers}
        categoryName={category?.name ?? null}
        categoryHref={category ? `/categories/${category.slug}` : null}
      />

      <RecentlyViewedSection
        excludeProductId={product.$id}
        embedded
      />
    </main>
  );
}
