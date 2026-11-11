import Link from "next/link";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { listAllPurchaseRequests } from "@/lib/services";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
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
import type { PurchaseRequestStatus } from "@/lib/types";

type AdminRequestsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function parseFilter(raw: string | undefined): PurchaseRequestStatus | null {
  if (raw === "requested" || raw === "sold" || raw === "cancelled") return raw;
  return null;
}

function requestTone(
  status: PurchaseRequestStatus,
): "neutral" | "positive" | "warning" | "danger" {
  if (status === "sold") return "positive";
  if (status === "cancelled") return "danger";
  return "warning";
}

export default async function AdminRequestsPage({
  searchParams,
}: AdminRequestsPageProps) {
  const { filter } = await searchParams;
  const status = parseFilter(filter);
  const requests = status
    ? await listAllPurchaseRequests({ status })
    : await listAllPurchaseRequests();

  const filterBar = (
    <FilterTabs
      tabs={[
        { href: "/admin/requests", label: "All", active: !status },
        {
          href: "/admin/requests?filter=requested",
          label: "Open",
          active: status === "requested",
        },
        {
          href: "/admin/requests?filter=sold",
          label: "Sold",
          active: status === "sold",
        },
        {
          href: "/admin/requests?filter=cancelled",
          label: "Cancelled",
          active: status === "cancelled",
        },
      ]}
    />
  );

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Requests"
        description="Read-only buy requests across the marketplace."
      />

      {requests.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty message="No requests found." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filterBar}
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Product
                </TableHead>
                <TableHead>
                  Qty
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  Buyer
                </TableHead>
                <TableHead>
                  Seller
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.$id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/products/${request.productId}`}
                      className="hover:underline"
                    >
                      {request.title}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {request.quantity}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      tone={requestTone(request.status)}
                      label={formatPurchaseRequestStatus(request.status)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {request.buyerId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {request.sellerId.slice(0, 8)}…
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
        </div>
      )}
    </div>
  );
}
