import Link from "next/link";
import {
  ListingDescription,
  ListingRowActions,
} from "@/components/admin/listing-moderation-actions";
import {
  getPublicSellerByUserId,
  listCategories,
  listPendingModerationQueue,
  listProductsByStatus,
} from "@/lib/services";

const PAGE_SIZE = 24;

function formatPrice(price: number, currency: string, isFree: boolean): string {
  if (isFree || price === 0) return "Free";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

type PageProps = {
  searchParams: Promise<{ view?: string; cursor?: string }>;
};

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = params.view === "active" ? "active" : "pending";
  const cursor = params.cursor?.trim() || undefined;

  const [listings, categories] = await Promise.all([
    view === "active"
      ? listProductsByStatus("active", { limit: PAGE_SIZE, cursor })
      : listPendingModerationQueue({ limit: PAGE_SIZE, cursor }),
    listCategories(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.$id, c.name]));

  const sellerIds = [...new Set(listings.map((p) => p.sellerId))];
  const sellerEntries = await Promise.all(
    sellerIds.map(async (id) => {
      const seller = await getPublicSellerByUserId(id);
      return [id, seller?.shopName ?? null] as const;
    }),
  );
  const sellerById = new Map(sellerEntries);

  const last = listings.at(-1);
  const nextCursor =
    listings.length === PAGE_SIZE && last ? last.$id : null;

  const nextHref = nextCursor
    ? `/admin/listings?${new URLSearchParams({
        view,
        cursor: nextCursor,
      }).toString()}`
    : null;

  const pendingHref = "/admin/listings?view=pending";
  const activeHref = "/admin/listings?view=active";

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        Listing moderation
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Review pending listings before they go live, or remove active listings
        from the storefront.
      </p>

      <nav className="mt-8 flex gap-2 font-mono text-sm">
        <Link
          href={pendingHref}
          className={
            view === "pending"
              ? "rounded-md border border-border bg-card px-3 py-2 font-bold"
              : "rounded-md border border-transparent px-3 py-2 text-muted-foreground hover:border-border"
          }
        >
          Pending review
        </Link>
        <Link
          href={activeHref}
          className={
            view === "active"
              ? "rounded-md border border-border bg-card px-3 py-2 font-bold"
              : "rounded-md border border-transparent px-3 py-2 text-muted-foreground hover:border-border"
          }
        >
          Active listings
        </Link>
      </nav>

      {listings.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          {view === "pending"
            ? "No listings awaiting review. When sellers submit products for approval, they will appear here."
            : "No active listings to manage."}
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {listings.map((product) => {
            const shopName = sellerById.get(product.sellerId);
            const categoryName =
              categoryById.get(product.categoryId) ?? product.categoryId;

            return (
              <li
                key={product.$id}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tracking-tight">
                      {product.title}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Seller: {shopName ?? product.sellerId}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold">
                    {formatPrice(
                      product.price,
                      product.currency,
                      product.isFree,
                    )}
                  </p>
                </div>

                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  Category: {categoryName}
                  {" · "}
                  {product.available ? "Available" : "Unavailable"}
                  {" · "}
                  Stock: {product.stock}
                  {product.featured ? " · Featured" : ""}
                </p>

                <ListingDescription description={product.description} />

                <div className="mt-4">
                  <ListingRowActions
                    productId={product.$id}
                    title={product.title}
                    view={view}
                    featured={product.featured}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
