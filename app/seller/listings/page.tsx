import Link from "next/link";
import { ArchiveListingButton } from "@/components/seller/archive-listing-button";
import { Badge } from "@/components/ui/badge";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import {
  listCategories,
  listOwnSellerProducts,
  listProductImages,
} from "@/lib/services";
import type { Product, ProductStatus } from "@/lib/types";

function formatPrice(product: Product): string {
  if (product.isFree || product.price === 0) return "Free";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: product.currency,
    }).format(product.price);
  } catch {
    return `${product.currency} ${product.price.toFixed(2)}`;
  }
}

function statusBadgeVariant(
  status: ProductStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "pending_review":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function SellerListingsPage() {
  const [products, categories] = await Promise.all([
    listOwnSellerProducts(),
    listCategories({ limit: 100 }),
  ]);

  const categoryById = new Map(categories.map((c) => [c.$id, c.name]));

  const rows = await Promise.all(
    products.map(async (product) => {
      const images = await listProductImages(product.$id);
      const firstImage = images[0];
      const thumbUrl = firstImage
        ? getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, firstImage.fileId, {
            width: 96,
            height: 96,
          })
        : null;
      return { product, thumbUrl };
    }),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-accent">$ ./seller --listings</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Listings</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Your products including drafts. Only active listings appear on the
            storefront.
          </p>
        </div>
        <Link
          href="/seller/listings/new"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Create listing
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No listings yet. Create your first draft product.
          </p>
          <Link
            href="/seller/listings/new"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Create listing →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {rows.map(({ product, thumbUrl }) => {
            const isArchived = product.status === "archived";
            return (
              <li
                key={product.$id}
                className="flex gap-4 rounded-md border border-border bg-card px-4 py-3"
              >
                <div
                  className="flex size-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/20"
                  aria-hidden={thumbUrl ? undefined : true}
                >
                  {thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      no img
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium tracking-tight">{product.title}</p>
                    <Badge variant={statusBadgeVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {formatPrice(product)} · stock {product.stock}
                    {categoryById.get(product.categoryId)
                      ? ` · ${categoryById.get(product.categoryId)}`
                      : null}
                  </p>
                  {!isArchived ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/seller/listings/${product.$id}/edit`}
                        className="text-sm text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      <ArchiveListingButton
                        productId={product.$id}
                        productTitle={product.title}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
