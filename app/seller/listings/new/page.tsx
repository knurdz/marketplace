import Link from "next/link";
import { CreateListingForm } from "@/components/seller/create-listing-form";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/categories";
import { areFreeListingsEnabled } from "@/lib/services/platform-settings";

export default async function NewListingPage() {
  const [categories, freeListingsEnabled] = await Promise.all([
    listCategories(),
    areFreeListingsEnabled(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">New listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Use <strong className="font-medium text-foreground">List item</strong> to
        save and submit for admin review in one step. Use{" "}
        <strong className="font-medium text-foreground">Save draft</strong> to
        keep it private until you submit from your listings page. Approved
        listings appear on the storefront.
      </p>

      <CreateListingForm
        categories={categories}
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
