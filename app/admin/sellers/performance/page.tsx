import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
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
    <div className="w-full">
      <PortalPageHeader
        title="Seller performance"
        description="Purchase-request KPIs for approved sellers. Sold, open, and cancelled counts come from buy requests on each shop."
        actions={
          <Button variant="info" size="sm" asChild>
            <Link href="/admin/sellers">
              <ClipboardCheck data-icon="inline-start" />
              Approvals
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message="No approved sellers yet. After an application is approved, their sold, open, and cancelled requests appear here."
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Cancelled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sellerId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/sellers/${row.profileId}`}
                      className="hover:text-accent hover:underline hover:underline-offset-2"
                    >
                      {row.shopName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    /shop/{row.slug}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatCount(row.orderCount)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatCount(row.pendingCount)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatCount(row.cancelledCount)}
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
