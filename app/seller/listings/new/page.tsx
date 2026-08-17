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
      <p className="font-mono text-sm text-accent">$ ./seller --listings new</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">New listing</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Saves as a draft. Submit it for admin review from your listings page
        before buyers can see it on the storefront.
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
