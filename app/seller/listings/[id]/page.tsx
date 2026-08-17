import Link from "next/link";
import { notFound } from "next/navigation";
import { EditListingForm } from "@/components/seller/edit-listing-form";
import { SubmitListingButton } from "@/components/seller/submit-listing-button";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/categories";
import { listProductImages } from "@/lib/services/products";
import { areFreeListingsEnabled } from "@/lib/services/platform-settings";
import {
  canSubmitListingForReview,
  getOwnProduct,
} from "@/lib/services/seller-listings";
import type { ProductStatus } from "@/lib/types";

function listingPublishStatusCopy(status: ProductStatus): string {
  switch (status) {
    case "draft":
      return "Drafts stay private until you submit for review. An admin must approve before the listing appears on the storefront.";
    case "rejected":
      return "This listing was rejected. Edit if needed, then submit again for review.";
    case "pending_review":
      return "Awaiting admin review. You can still edit details until it is approved.";
    case "active":
      return "This listing is live on the storefront. Buyers can purchase when stock is available.";
    case "archived":
      return "This listing is archived and hidden from buyers.";
    default:
      return "Update your listing details below.";
  }
}

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const [product, categories, freeListingsEnabled] = await Promise.all([
    getOwnProduct(id),
    listCategories(),
    areFreeListingsEnabled(),
  ]);

  if (!product) {
    notFound();
  }

  const images = await listProductImages(product.$id);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --listings edit</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Edit listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {listingPublishStatusCopy(product.status)}
      </p>

      {canSubmitListingForReview(product.status) ? (
        <div className="mt-4">
          <SubmitListingButton productId={product.$id} />
        </div>
      ) : null}

      <EditListingForm
        product={product}
        categories={categories}
        images={images}
        freeListingsEnabled={freeListingsEnabled}
      />

      <div className="mt-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/listings">Back to listings</Link>
        </Button>
      </div>
    </div>
  );
}
