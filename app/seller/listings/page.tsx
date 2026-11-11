import Link from "next/link";
import { Package, Pencil } from "lucide-react";
import { CreateListingForm } from "@/components/seller/create-listing-form";
import { EditListingForm } from "@/components/seller/edit-listing-form";
import { ListingFormDrawer } from "@/components/seller/listing-form-drawer";
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
import { DataTableShell } from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import { SubmitListingButton } from "@/components/seller/submit-listing-button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import { listCategories } from "@/lib/services/categories";
import { StorageImage } from "@/components/ui/storage-image";
import { listCoverImagesByProductIds, listProductImages } from "@/lib/services/products";
import { areFreeListingsEnabled } from "@/lib/services/platform-settings";
import {
  canSubmitListingForReview,
  countProductImagesForOwnProducts,
  getOwnProduct,
  listOwnProducts,
} from "@/lib/services/seller-listings";
import { productStatusTone } from "@/lib/ui/status-tone";

function formatPrice(price: number, currency: string, isFree: boolean): string {
  if (isFree || price === 0) return "Free";
  return `${currency} ${price.toLocaleString()}`;
}

function editHref(id: string): string {
  return `/seller/listings?edit=${encodeURIComponent(id)}`;
}

type SellerListingsPageProps = {
  searchParams: Promise<{ compose?: string; edit?: string }>;
};

export default async function SellerListingsPage({
  searchParams,
}: SellerListingsPageProps) {
  const { compose, edit } = await searchParams;
  const editId = edit?.trim() ?? "";
  const creating = compose === "new" && !editId;

  const [products, categories] = await Promise.all([
    listOwnProducts(),
    listCategories(),
  ]);

  const [imageCounts, covers, editingProduct, freeListingsEnabled] =
    await Promise.all([
      countProductImagesForOwnProducts(products),
      listCoverImagesByProductIds(products.map((product) => product.$id)),
      editId ? getOwnProduct(editId) : Promise.resolve(null),
      creating || editId ? areFreeListingsEnabled() : Promise.resolve(false),
    ]);

  const editingImages = editingProduct
    ? await listProductImages(editingProduct.$id)
    : [];

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Listings"
        description="Drafts stay private until you submit for review. Approved listings appear on the storefront."
        actions={
          <Button variant="info" asChild disabled={categories.length === 0}>
            <Link href="/seller/listings?compose=new">New listing</Link>
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
              <Button variant="info" asChild>
                <Link href="/seller/listings?compose=new">Create draft listing</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const imageCount = imageCounts.get(product.$id) ?? 0;
                const cover = covers[product.$id];
                const coverUrl = cover
                  ? getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, cover.fileId, {
                      width: 96,
                      height: 96,
                    })
                  : null;

                return (
                  <TableRow key={product.$id}>
                    <TableCell className="max-w-[360px]">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                          {coverUrl ? (
                            <StorageImage
                              src={coverUrl}
                              alt=""
                              className="size-full"
                              imgClassName="object-cover"
                              fallback={
                                <Package
                                  className="size-3.5 text-muted-foreground"
                                  aria-hidden
                                />
                              }
                            />
                          ) : (
                            <Package
                              className="size-3.5 text-muted-foreground"
                              aria-hidden
                            />
                          )}
                        </div>
                        <Link
                          href={editHref(product.$id)}
                          className="truncate font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={product.status}
                        tone={productStatusTone(product.status)}
                      />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatPrice(
                        product.price,
                        product.currency,
                        product.isFree,
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {product.stock} ·{" "}
                      {product.available ? "Available" : "Unavailable"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {imageCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button variant="info" size="xs" asChild>
                          <Link href={editHref(product.$id)}>
                            <Pencil data-icon="inline-start" />
                            Edit
                          </Link>
                        </Button>
                        {canSubmitListingForReview(product.status) ? (
                          <SubmitListingButton productId={product.$id} />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {creating ? (
        <ListingFormDrawer
          title="New listing"
          description="List item saves and sends it for review. Save draft keeps it private until you submit."
        >
          <CreateListingForm
            categories={categories}
            freeListingsEnabled={freeListingsEnabled}
          />
        </ListingFormDrawer>
      ) : null}

      {editingProduct ? (
        <ListingFormDrawer
          title="Edit listing"
          description={editingProduct.title}
        >
          <EditListingForm
            key={editingProduct.$id}
            product={editingProduct}
            categories={categories}
            images={editingImages}
            freeListingsEnabled={freeListingsEnabled}
          />
        </ListingFormDrawer>
      ) : null}
    </div>
  );
}
