import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { BuyerAccountShell } from "@/components/store/buyer-account-shell";
import { WishlistList } from "@/components/store/wishlist-list";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/backend/config";
import { getFilePreviewUrl } from "@/lib/backend/storage-urls";
import { getLoggedInUser } from "@/lib/backend/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { getOwnWishlistView, listCoverImagesByProductIds } from "@/lib/services";

export const metadata: Metadata = buildNoIndexMetadata(
  "Wishlist",
  "Products saved to your Knurdz Marketplace wishlist.",
);

export default async function WishlistPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const view = await getOwnWishlistView();
  const covers = await listCoverImagesByProductIds(
    view.lines.map((line) => line.item.productId),
  );
  const imageByProductId = Object.fromEntries(
    Object.entries(covers).map(([id, cover]) => [
      id,
      getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, cover.fileId, {
        width: 480,
        height: 480,
      }),
    ]),
  );

  return (
    <BuyerAccountShell
      title="Wishlist"
      description="Saved products for your account."
      actions={
        <Button variant="info" size="sm" asChild>
          <Link href="/market">Browse market</Link>
        </Button>
      }
    >
      {view.lines.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Open a listing and tap Save."
          action={
            <Button asChild>
              <Link href="/market">Browse listings</Link>
            </Button>
          }
        />
      ) : (
        <WishlistList lines={view.lines} imageByProductId={imageByProductId} />
      )}
    </BuyerAccountShell>
  );
}
