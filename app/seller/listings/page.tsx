import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SubmitListingButton } from "@/components/seller/submit-listing-button";
import { listCategories } from "@/lib/services/categories";
import {
  canSubmitListingForReview,
  countProductImagesForOwnProducts,
  listOwnProducts,
} from "@/lib/services/seller-listings";

function formatPrice(price: number, currency: string, isFree: boolean): string {
  if (isFree || price === 0) return "Free";
  return `${currency} ${price.toLocaleString()}`;
}

export default async function SellerListingsPage() {
  const [products, categories] = await Promise.all([
    listOwnProducts(),
    listCategories(),
  ]);

  const imageCounts = await countProductImagesForOwnProducts(products);

  return (
    <div>
      <PageHeader
        headingAs="h2"
        title="Listings"
        description="Drafts stay private until you submit for review. Approved listings appear on the storefront."
        actions={
          <Button asChild disabled={categories.length === 0}>
            <Link href="/seller/listings/new">New listing</Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No listings yet"
          description="Create your first draft to get started."
          action={
            categories.length > 0 ? (
              <Button asChild>
                <Link href="/seller/listings/new">Create draft listing</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="mt-10 divide-y divide-border rounded-md border border-border bg-card">
          {products.map((product) => (
            <li
              key={product.$id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/seller/listings/${product.$id}`}
                  className="truncate font-medium hover:underline"
                >
                  {product.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(product.price, product.currency, product.isFree)}
                  {" · "}
                  {product.stock} in stock
                  {" · "}
                  {product.available ? "Available" : "Unavailable"}
                  {" · "}
                  {imageCounts.get(product.$id) ?? 0} image
                  {(imageCounts.get(product.$id) ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{product.status}</Badge>
                {canSubmitListingForReview(product.status) ? (
                  <SubmitListingButton productId={product.$id} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
