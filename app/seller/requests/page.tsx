import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { listSellerPurchaseRequests } from "@/lib/services";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function requestTone(
  status: "requested" | "sold" | "cancelled",
): "neutral" | "positive" | "warning" | "danger" {
  if (status === "sold") return "positive";
  if (status === "cancelled") return "danger";
  return "warning";
}

type SellerRequestsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function SellerRequestsPage({
  searchParams,
}: SellerRequestsPageProps) {
  const { filter } = await searchParams;
  const openOnly = filter === "open";
  const requests = openOnly
    ? await listSellerPurchaseRequests({ status: "requested" })
    : await listSellerPurchaseRequests();

  const filterBar = (
    <FilterTabs
      tabs={[
        { href: "/seller/requests", label: "All", active: !openOnly },
        {
          href: "/seller/requests?filter=open",
          label: "Open",
          active: openOnly,
        },
      ]}
    />
  );

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Requests"
        description="Buy requests from shoppers. Contact them directly, then mark sold or cancelled."
      />

      {requests.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty
            message={openOnly ? "No open requests." : "No requests yet."}
          />
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
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.$id}>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell className="tabular-nums">
                    {request.quantity}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      tone={requestTone(request.status)}
                      label={formatPurchaseRequestStatus(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="xs" asChild>
                      <Link
                        href={`/seller/requests/${request.$id}`}
                        data-testid="seller-request-link"
                      >
                        <ExternalLink
                          data-icon="inline-start"
                          className="size-3"
                        />
                        View
                      </Link>
                    </Button>
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
