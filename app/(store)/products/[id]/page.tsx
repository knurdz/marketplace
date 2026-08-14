import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { ProductReviewsPlaceholder } from "@/components/store/product-reviews-placeholder";
import { ReportListingButton } from "@/components/store/report-listing-button";
import { SellerInfoCard } from "@/components/store/seller-info-card";
import { WishlistToggleButton } from "@/components/store/wishlist-toggle-button";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  canReviewProduct,
  getProduct,
  getPublicSellerByUserId,
  isProductInOwnWishlist,
  listProductImages,
  listProductReviews,
} from "@/lib/services";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, user] = await Promise.all([getProduct(id), getLoggedInUser()]);
  if (!product) notFound();

  const [images, seller, saved, reviews, reviewEligibility] = await Promise.all([
    listProductImages(product.$id),
    getPublicSellerByUserId(product.sellerId),
    user ? isProductInOwnWishlist(product.$id) : Promise.resolve(false),
    listProductReviews(product.$id),
    user ? canReviewProduct(product.$id) : Promise.resolve({ eligible: false }),
  ]);

  const priceLabel = product.isFree
    ? "free"
    : `${product.currency} ${product.price.toFixed(2)}`;

  const canBuy = product.available && product.stock > 0;
  const loginHref = `/login?next=${encodeURIComponent(`/products/${product.$id}`)}`;

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./products --id={product.$id}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ProductImageGallery images={images} productTitle={product.title} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-3 font-mono text-lg text-muted-foreground">
            {priceLabel}
          </p>
          {product.stock > 0 ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {product.stock} in stock
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Out of stock
            </p>
          )}

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

          <section aria-labelledby="description-heading" className="mt-8">
            <h2
              id="description-heading"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              Description
            </h2>
            <p className="mt-4 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
              {product.description}
            </p>
          </section>
        </div>
      </div>

      <SellerInfoCard seller={seller} />
      <ProductReviewsPlaceholder
        productId={product.$id}
        reviews={reviews}
        canReview={reviewEligibility.eligible}
        isLoggedIn={Boolean(user)}
        loginHref={loginHref}
      />

      <p className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/categories">All categories</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/#active-listings">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
