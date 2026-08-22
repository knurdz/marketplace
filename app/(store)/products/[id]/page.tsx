import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { ProductReviewsPlaceholder } from "@/components/store/product-reviews-placeholder";
import { RecordRecentlyViewed } from "@/components/store/record-recently-viewed";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { ReportListingButton } from "@/components/store/report-listing-button";
import { SellerInfoCard } from "@/components/store/seller-info-card";
import { WishlistToggleButton } from "@/components/store/wishlist-toggle-button";
import { formatProductPrice } from "@/components/store/product-display";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  canReviewProduct,
  getProduct,
  getPublicSellerByUserId,
  isProductInOwnWishlist,
  isProductPurchasable,
  listCategories,
  listProductImages,
  listProductReviews,
  recordMarketplaceView,
} from "@/lib/services";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

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

  const [images, seller, saved, reviews, reviewEligibility] = await Promise.all([
    listProductImages(product.$id),
    getPublicSellerByUserId(product.sellerId),
    user ? isProductInOwnWishlist(product.$id) : Promise.resolve(false),
    listProductReviews(product.$id),
    user ? canReviewProduct(product.$id) : Promise.resolve({ eligible: false }),
  ]);

  const category = categories.find((entry) => entry.$id === product.categoryId);
  const priceLabel = formatProductPrice(product);
  const canBuy = isProductPurchasable(product);
  const loginHref = `/login?next=${encodeURIComponent(`/products/${product.$id}`)}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <RecordRecentlyViewed productId={product.$id} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/market">Market</Link>
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
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Featured
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 font-mono text-2xl tabular-nums">{priceLabel}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {canBuy ? (
            <AddToCartButton
              productId={product.$id}
              maxStock={product.stock}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              {!product.available
                ? "This item is currently unavailable."
                : "Out of stock — check back later."}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            <WishlistToggleButton
              productId={product.$id}
              initialSaved={saved}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
            <ReportListingButton
              productId={product.$id}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
          </div>

          <section aria-labelledby="description-heading" className="mt-10 border-t border-border pt-8">
            <h2 id="description-heading" className="text-sm font-medium">
              Description
            </h2>
            <p className="mt-4 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </section>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <SellerInfoCard seller={seller} />
        <ProductReviewsPlaceholder
          productId={product.$id}
          reviews={reviews}
          canReview={reviewEligibility.eligible}
          isLoggedIn={Boolean(user)}
          loginHref={loginHref}
        />
      </div>

      <p className="mt-12">
        <Button variant="secondary" asChild>
          <Link href="/market">Back to listings</Link>
        </Button>
      </p>

      <RecentlyViewedSection excludeProductId={product.$id} />
    </main>
  );
}
