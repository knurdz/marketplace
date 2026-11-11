import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { formatPurchaseRequestStatus } from "@/lib/request-display";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listOwnPurchaseRequests } from "@/lib/services";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
} from "@/components/layout/data-table-shell";
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

type BuyerRequestsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function BuyerRequestsPage({
  searchParams,
}: BuyerRequestsPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/requests")}`);
  }

  const { filter } = await searchParams;
  const openOnly = filter === "open";
  const requests = openOnly
    ? await listOwnPurchaseRequests({ status: "requested" })
    : await listOwnPurchaseRequests();

  const filterBar = (
    <FilterTabs
      tabs={[
        { href: "/requests", label: "All", active: !openOnly },
        {
          href: "/requests?filter=open",
          label: "Open",
          active: openOnly,
        },
      ]}
    />
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">Your requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buy requests you sent to sellers. Contact details stay on each request.
      </p>

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
                        href={`/requests/${request.$id}`}
                        data-testid="buyer-request-link"
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
    </main>
  );
}
