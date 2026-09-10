import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-accent uppercase">
              Featured
            </span>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.title}
          </h1>

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

          {/* Primary purchase and wishlist actions aligned together */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canBuy ? (
              <AddToCartButton
                productId={product.$id}
                maxStock={product.stock}
                isLoggedIn={Boolean(user)}
                loginHref={loginHref}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {!product.available
                  ? "This item is currently unavailable."
                  : "Out of stock — check back later."}
              </p>
            )}

            <WishlistToggleButton
              productId={product.$id}
              initialSaved={saved}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
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
            <span className="font-mono text-[11px]">
              Listing SKU: <span className="text-foreground/70">{product.$id.slice(-8).toUpperCase()}</span>
            </span>
            <ReportListingButton
              productId={product.$id}
              isLoggedIn={Boolean(user)}
              loginHref={loginHref}
            />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <SellerInfoCard seller={seller} />
        <ProductReviewsPlaceholder
          productId={product.$id}
          reviews={reviews}
          canReview={reviewEligibility.eligible}
          isLoggedIn={Boolean(user)}
          loginHref={loginHref}
        />
      </div>

      <div className="mt-10">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/market">
            <ArrowLeft className="size-4" />
            Back to listings
          </Link>
        </Button>
      </div>

      <RecentlyViewedSection excludeProductId={product.$id} />
    </main>
  );
}
