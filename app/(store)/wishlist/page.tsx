import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { WishlistList } from "@/components/store/wishlist-list";
import { Button } from "@/components/ui/button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnWishlistView, listCoverImagesByProductIds } from "@/lib/services";

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
        width: 128,
        height: 128,
      }),
    ]),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Wishlist"
        description="Saved products for your account."
        actions={
          <Button variant="secondary" asChild>
            <Link href="/orders">Orders</Link>
          </Button>
        }
      />

      {view.lines.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Nothing saved yet"
          description="Open a listing and tap Save."
          action={
            <Button asChild>
              <Link href="/market">Browse listings</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-10">
          <WishlistList lines={view.lines} imageByProductId={imageByProductId} />
        </div>
      )}
    </main>
  );
}
