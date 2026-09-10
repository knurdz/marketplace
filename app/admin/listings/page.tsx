import Link from "next/link";
import {
  ListingDescription,
  ListingRowActions,
} from "@/components/admin/listing-moderation-actions";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productStatusTone } from "@/lib/ui/status-tone";
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

  return (
    <div>
      <PortalPageHeader
        title="Listing moderation"
        description="Review pending listings before they go live, or remove active listings from the storefront."
      />

      <FilterTabs
        className="mt-6"
        tabs={[
          {
            href: "/admin/listings?view=pending",
            label: "Pending review",
            active: view === "pending",
          },
          {
            href: "/admin/listings?view=active",
            label: "Active listings",
            active: view === "active",
          },
        ]}
      />

      {listings.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message={
            view === "pending"
              ? "No listings awaiting review. When sellers submit products for approval, they will appear here."
              : "No active listings to manage."
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Listing</TableHead>
                <TableHead className="px-4">Seller</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4 text-right">Price</TableHead>
                <TableHead className="px-4">Stock</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((product) => {
                const shopName = sellerById.get(product.sellerId);
                const categoryName =
                  categoryById.get(product.categoryId) ?? product.categoryId;

                return (
                  <TableRow key={product.$id} className="align-top">
                    <TableCell className="max-w-[420px] px-4 py-3 whitespace-normal">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/products/${product.$id}`}
                          className="font-medium tracking-tight hover:underline"
                        >
                          {product.title}
                        </Link>
                        <StatusPill
                          label={product.status}
                          tone={productStatusTone(product.status)}
                        />
                        {product.featured ? (
                          <StatusPill label="featured" tone="info" />
                        ) : null}
                      </div>
                      <ListingDescription description={product.description} />
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {shopName ?? product.sellerId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {categoryName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums">
                      {formatPrice(
                        product.price,
                        product.currency,
                        product.isFree,
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                      {product.stock}
                      <span className="block">
                        {product.available ? "available" : "unavailable"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[260px] max-w-[260px] px-4 py-3 whitespace-normal">
                      <ListingRowActions
                        productId={product.$id}
                        title={product.title}
                        view={view}
                        featured={product.featured}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {nextHref ? <LoadMoreLink href={nextHref} /> : null}
    </div>
  );
}
