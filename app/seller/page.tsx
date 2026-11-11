import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSellerDashboardSnapshot } from "@/lib/services";
import { DataTableShell } from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { PortalPanel } from "@/components/layout/portal-panel";
import { StatusPill } from "@/components/layout/status-pill";
import { SellerDashboardCharts } from "@/components/seller/seller-dashboard-charts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { purchaseRequestStatusTone } from "@/lib/ui/status-tone";

export default async function SellerPage() {
  const snapshot = await getSellerDashboardSnapshot();
  const {
    metrics,
    listingCounts,
    recentRequests,
    lowStock,
    shop,
    views,
    viewProducts,
    earningsSeries,
    requestSeries,
    reviewInsights,
  } = snapshot;

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Dashboard"
        description="Traffic, requests, and listings at a glance."
        actions={
          <Button size="sm" variant="info" asChild>
            <Link href="/seller/listings?compose=new">New listing</Link>
          </Button>
        }
      />

      <SellerDashboardCharts
        metrics={metrics}
        listingCounts={listingCounts}
        views={views}
        earningsSeries={earningsSeries}
        requestSeries={requestSeries}
        viewProducts={viewProducts}
        shopName={shop.shopName}
        reviewInsights={reviewInsights}
      />

      <PortalPanel className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Recent requests
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact buyers from each request, then mark sold or cancelled.
            </p>
          </div>
          <Button variant="info" size="sm" asChild>
            <Link href="/seller/requests">All requests</Link>
          </Button>
        </div>
        {recentRequests.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <DataTableShell className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.$id}>
                    <TableCell className="font-medium">
                      {request.title}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {request.quantity}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        tone={purchaseRequestStatusTone(request.status)}
                        label={formatPurchaseRequestStatus(request.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="info" size="xs" asChild>
                        <Link href={`/seller/requests/${request.$id}`}>
                          <ExternalLink
                            data-icon="inline-start"
                          />
                          Open
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </PortalPanel>

      {lowStock.length > 0 ? (
        <PortalPanel className="mt-6">
          <h3 className="text-base font-semibold tracking-tight">Low stock</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {lowStock.map((product) => (
              <li key={product.$id} className="flex justify-between gap-3">
                <Link
                  href={`/seller/listings?edit=${encodeURIComponent(product.$id)}`}
                  className="font-medium hover:underline"
                >
                  {product.title}
                </Link>
                <span className="tabular-nums text-muted-foreground">
                  {product.stock}
                </span>
              </li>
            ))}
          </ul>
        </PortalPanel>
      ) : null}
    </div>
  );
}
