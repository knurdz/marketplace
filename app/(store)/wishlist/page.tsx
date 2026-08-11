import Link from "next/link";
import { redirect } from "next/navigation";
import { WishlistList } from "@/components/store/wishlist-list";
import { Button } from "@/components/ui/button";
import { BUCKET_PRODUCT_IMAGES } from "@/lib/appwrite/config";
import { getFilePreviewUrl } from "@/lib/appwrite/storage-urls";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  getOwnWishlistView,
  listProductImages,
} from "@/lib/services";

export default async function WishlistPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const view = await getOwnWishlistView();
  const imageEntries = await Promise.all(
    view.lines.map(async (line) => {
      if (!line.product) {
        return [line.item.productId, null] as const;
      }
      const images = await listProductImages(line.product.$id);
      const first = images[0];
      const url = first
        ? getFilePreviewUrl(BUCKET_PRODUCT_IMAGES, first.fileId, {
            width: 128,
            height: 128,
          })
        : null;
      return [line.item.productId, url] as const;
    }),
  );
  const imageByProductId = Object.fromEntries(imageEntries);

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./wishlist --list</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Your wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved products for your account. Only you can view or change this list.
      </p>

      {view.lines.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          You have not saved any products yet. Browse listings and tap Save on a
          product page.
        </p>
      ) : (
        <WishlistList lines={view.lines} imageByProductId={imageByProductId} />
      )}

      <p className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Browse listings</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">Your orders</Link>
        </Button>
      </p>
    </main>
  );
}
