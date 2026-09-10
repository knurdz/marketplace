import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/layout/empty-state";
import {
  DataTableShell,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import { SubmitListingButton } from "@/components/seller/submit-listing-button";
import { listCategories } from "@/lib/services/categories";
import {
  canSubmitListingForReview,
  countProductImagesForOwnProducts,
  listOwnProducts,
} from "@/lib/services/seller-listings";
import { productStatusTone } from "@/lib/ui/status-tone";

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
      <PortalPageHeader
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
          className="mt-6"
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
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Listing</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Price</TableHead>
                <TableHead className="px-4">Stock</TableHead>
                <TableHead className="px-4">Images</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const imageCount = imageCounts.get(product.$id) ?? 0;
                return (
                  <TableRow key={product.$id}>
                    <TableCell className="max-w-[360px] px-4 py-3">
                      <Link
                        href={`/seller/listings/${product.$id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill
                        label={product.status}
                        tone={productStatusTone(product.status)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                      {formatPrice(
                        product.price,
                        product.currency,
                        product.isFree,
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                      {product.stock}
                      <span className="block">
                        {product.available ? "available" : "unavailable"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                      {imageCount}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {canSubmitListingForReview(product.status) ? (
                        <SubmitListingButton productId={product.$id} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
