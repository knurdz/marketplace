import Link from "next/link";
import {
  DataTableEmpty,
  DataTableShell,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listApprovedSellerPerformance } from "@/lib/services";

const PAGE_SIZE = 25;

type PageProps = {
  searchParams: Promise<{ cursor?: string }>;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRevenue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export default async function AdminSellerPerformancePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const cursor = params.cursor?.trim() || undefined;

  const { rows, nextCursor } = await listApprovedSellerPerformance({
    limit: PAGE_SIZE,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/sellers/performance?${new URLSearchParams({
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <PortalPageHeader
        title="Seller performance"
        description="Basic KPIs for approved sellers. Revenue matches paid payments on the seller earnings view. Pending is paid through ready-for-pickup, not unpaid checkout."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/sellers">Approvals</Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message="No approved sellers yet. After an application is approved, their orders, pending fulfillment, and paid revenue appear here."
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Shop</TableHead>
                <TableHead className="px-4">Slug</TableHead>
                <TableHead className="px-4 text-right">Orders</TableHead>
                <TableHead className="px-4 text-right">Pending</TableHead>
                <TableHead className="px-4 text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sellerId}>
                  <TableCell className="px-4 font-medium">
                    <Link
                      href={`/shop/${row.slug}`}
                      className="hover:text-accent hover:underline hover:underline-offset-2"
                    >
                      {row.shopName}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                    /shop/{row.slug}
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono text-sm tabular-nums">
                    {formatCount(row.orderCount)}
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono text-sm tabular-nums">
                    {formatCount(row.pendingCount)}
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono text-sm tabular-nums">
                    {formatRevenue(row.revenue, row.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {nextHref ? <LoadMoreLink href={nextHref} label="Next page" /> : null}
    </div>
  );
}
