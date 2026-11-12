import Link from "next/link";
import {
  ListingChangeLines,
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
  buildAdminChangeLines,
  getPublicSellerByUserId,
  listCategories,
  listModerationQueueItems,
  listProductIdsWithRevisions,
  listProductImages,
  listProductsByStatus,
} from "@/lib/services";
import type { ModerationQueueKind } from "@/lib/types/listing-revision";

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

function moderationKindLabel(kind: ModerationQueueKind): string {
  return kind === "edit" ? "Edit" : "New";
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const viewMode = params.view === "active" ? "active" : "pending";
  const cursor = params.cursor?.trim() || undefined;

  const categories = await listCategories();
  const categoryById = new Map(categories.map((c) => [c.$id, c.name]));

  const filterBar = (
    <FilterTabs
      tabs={[
        {
          href: "/admin/listings?view=pending",
          label: "Pending review",
          active: viewMode === "pending",
        },
        {
          href: "/admin/listings?view=active",
          label: "Active listings",
          active: viewMode === "active",
        },
      ]}
    />
  );

  if (viewMode === "pending") {
    const { items, nextCursor } = await listModerationQueueItems({
      limit: PAGE_SIZE,
      cursor,
    });

    const enriched = await Promise.all(
      items.map(async (item) => {
        if (item.kind === "edit" && item.revision) {
          const liveImages = await listProductImages(item.product.$id);
          const changeLines = buildAdminChangeLines(
            item.product,
            item.revision.patch,
            { categoryNameById: categoryById, liveImages },
          );
          return { ...item, changeLines };
        }
        return item;
      }),
    );

    const sellerIds = [...new Set(enriched.map((p) => p.product.sellerId))];
    const sellerEntries = await Promise.all(
      sellerIds.map(async (id) => {
        const seller = await getPublicSellerByUserId(id);
        return [id, seller?.shopName ?? null] as const;
      }),
    );
    const sellerById = new Map(sellerEntries);

    const nextHref = nextCursor
      ? `/admin/listings?${new URLSearchParams({
          view: viewMode,
          cursor: nextCursor,
        }).toString()}`
      : null;

    return (
      <div className="w-full">
        <PortalPageHeader
          title="Listing moderation"
          description="Review new listings and seller edits before they go live, or remove active listings from the storefront."
        />

        {enriched.length === 0 ? (
          <div className="mt-6 space-y-4">
            {filterBar}
            <DataTableEmpty message="No listings awaiting review. When sellers submit products or edits, they will appear here." />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filterBar}
            <DataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enriched.map((item) => {
                    const product = item.product;
                    const shopName = sellerById.get(product.sellerId);
                    const categoryName =
                      categoryById.get(product.categoryId) ?? product.categoryId;

                    const displayTitle =
                      item.kind === "edit" && item.revision?.patch.title
                        ? item.revision.patch.title
                        : product.title;

                    const displayDescription =
                      item.kind === "edit" && item.revision?.patch.description
                        ? item.revision.patch.description
                        : product.description;

                    return (
                      <TableRow key={product.$id} className="align-top">
                        <TableCell className="max-w-[420px] whitespace-normal">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/products/${product.$id}`}
                              className="font-medium tracking-tight hover:underline"
                            >
                              {displayTitle}
                            </Link>
                            <StatusPill
                              label={moderationKindLabel(item.kind)}
                              tone={item.kind === "edit" ? "warning" : "info"}
                            />
                            <StatusPill
                              label={product.status}
                              tone={productStatusTone(product.status)}
                            />
                            {product.featured ? (
                              <StatusPill label="featured" tone="info" />
                            ) : null}
                          </div>
                          <ListingDescription description={displayDescription} />
                          {item.kind === "edit" ? (
                            <ListingChangeLines lines={item.changeLines} />
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {shopName ?? product.sellerId}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {categoryName}
                        </TableCell>
                        <TableCell className="text-sm font-medium tabular-nums">
                          {formatPrice(
                            product.price,
                            product.currency,
                            product.isFree,
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {product.stock} ·{" "}
                          {product.available ? "Available" : "Unavailable"}
                        </TableCell>
                        <TableCell className="w-[260px] max-w-[260px] whitespace-normal">
                          <ListingRowActions
                            productId={product.$id}
                            title={displayTitle}
                            view={viewMode}
                            featured={product.featured}
                            moderationKind={item.kind}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </DataTableShell>
            {nextHref ? <LoadMoreLink href={nextHref} /> : null}
          </div>
        )}
      </div>
    );
  }

  const listings = await listProductsByStatus("active", {
    limit: PAGE_SIZE,
    cursor,
  });

  const pendingEditIds = await listProductIdsWithRevisions(
    listings.map((p) => p.$id),
  );

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
        view: viewMode,
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Listing moderation"
        description="Review new listings and seller edits before they go live, or remove active listings from the storefront."
      />

      {listings.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty message="No active listings to manage." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((product) => {
                  const shopName = sellerById.get(product.sellerId);
                  const categoryName =
                    categoryById.get(product.categoryId) ?? product.categoryId;
                  const hasPendingEdit = pendingEditIds.has(product.$id);

                  return (
                    <TableRow key={product.$id} className="align-top">
                      <TableCell className="max-w-[420px] whitespace-normal">
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
                          {hasPendingEdit ? (
                            <StatusPill label="Edit" tone="warning" />
                          ) : null}
                          {product.featured ? (
                            <StatusPill label="featured" tone="info" />
                          ) : null}
                        </div>
                        <ListingDescription description={product.description} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {shopName ?? product.sellerId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {categoryName}
                      </TableCell>
                      <TableCell className="text-sm font-medium tabular-nums">
                        {formatPrice(
                          product.price,
                          product.currency,
                          product.isFree,
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {product.stock} ·{" "}
                        {product.available ? "Available" : "Unavailable"}
                      </TableCell>
                      <TableCell className="w-[260px] max-w-[260px] whitespace-normal">
                        <ListingRowActions
                          productId={product.$id}
                          title={product.title}
                          view={viewMode}
                          featured={product.featured}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DataTableShell>
          {nextHref ? <LoadMoreLink href={nextHref} /> : null}
        </div>
      )}
    </div>
  );
}
