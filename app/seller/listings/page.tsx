import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/categories";
import {
  countProductImagesForOwnProducts,
  listOwnProducts,
} from "@/lib/services/seller-listings";

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
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-accent">$ ./seller --listings</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Listings</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Drafts stay private until you publish (step 3.6). Only you can see
            them here.
          </p>
        </div>
        <Button asChild disabled={categories.length === 0}>
          <Link href="/seller/listings/new">New listing</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-md border border-border bg-card px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No listings yet. Create your first draft to get started.
          </p>
          {categories.length > 0 ? (
            <Button className="mt-4" asChild>
              <Link href="/seller/listings/new">Create draft listing</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border rounded-md border border-border bg-card">
          {products.map((product) => (
            <li
              key={product.$id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/seller/listings/${product.$id}`}
                  className="truncate font-medium hover:underline"
                >
                  {product.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(product.price, product.currency, product.isFree)}
                  {" · "}
                  {imageCounts.get(product.$id) ?? 0} image
                  {(imageCounts.get(product.$id) ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{product.status}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/seller/listings/${product.$id}`}>Edit</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
