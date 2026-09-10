import Link from "next/link";
import { CreateListingForm } from "@/components/seller/create-listing-form";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/categories";
import { areFreeListingsEnabled } from "@/lib/services/platform-settings";

export default async function NewListingPage() {
  const [categories, freeListingsEnabled] = await Promise.all([
    listCategories(),
    areFreeListingsEnabled(),
  ]);

  return (
    <div className="max-w-3xl">
      <PortalPageHeader
        title="New listing"
        description="Use List item to save and submit for admin review in one step. Use Save draft to keep it private until you submit from your listings page."
      />

      <div className="mt-6">
        <CreateListingForm
          categories={categories}
          freeListingsEnabled={freeListingsEnabled}
        />
      </div>

      <div className="mt-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/listings">Back to listings</Link>
        </Button>
      </div>
    </div>
  );
}
