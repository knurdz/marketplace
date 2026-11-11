import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  SellerApproveButton,
  SellerRejectForm,
} from "@/components/admin/seller-approval-actions";
import {
  DataTableEmpty,
  DataTableShell,
  FilterTabs,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill, type StatusTone } from "@/components/layout/status-pill";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listPendingSellerApplications,
  listSellerProfilesAdmin,
} from "@/lib/services/seller-approvals";
import type { SellerStatus } from "@/lib/types";

type SellersFilter = "all" | "pending";

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function parseFilter(raw: string | undefined): SellersFilter {
  return raw === "all" ? "all" : "pending";
}

function formatAppliedAt(iso: string | undefined): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusTone(status: SellerStatus): StatusTone {
  if (status === "approved") return "positive";
  if (status === "pending") return "warning";
  return "danger";
}

export default async function AdminSellersPage({ searchParams }: PageProps) {
  const { filter: filterRaw } = await searchParams;
  const filter = parseFilter(filterRaw);

  const sellers =
    filter === "pending"
      ? await listPendingSellerApplications()
      : await listSellerProfilesAdmin();

  const filterBar = (
    <FilterTabs
      tabs={[
        {
          href: "/admin/sellers",
          label: "Pending",
          active: filter === "pending",
        },
        {
          href: "/admin/sellers?filter=all",
          label: "All sellers",
          active: filter === "all",
        },
      ]}
    />
  );

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Sellers"
        description="Browse all seller profiles or review pending applications. Approving grants the seller label and unlocks the seller portal."
        actions={
          <Button variant="info" size="sm" asChild>
            <Link href="/admin/sellers/performance">Performance</Link>
          </Button>
        }
      />

      {sellers.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty
            message={
              filter === "pending"
                ? "No pending applications. New seller registrations appear here until you approve or reject them."
                : "No sellers yet."
            }
          />
        </div>
      ) : filter === "pending" ? (
        <div className="mt-6 space-y-4">
          {filterBar}
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Shop
                </TableHead>
                <TableHead>
                  Applied
                </TableHead>
                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((app) => (
                <TableRow key={app.$id} className="align-top">
                  <TableCell className="max-w-[420px] whitespace-normal">
                    <Link
                      href={`/admin/sellers/${app.$id}`}
                      className="font-medium tracking-tight hover:text-accent hover:underline hover:underline-offset-2"
                    >
                      {app.shopName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      /shop/{app.slug}
                    </p>
                    {app.bio ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {app.bio}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatAppliedAt(app.$createdAt)}
                  </TableCell>
                  <TableCell className="w-[260px] max-w-[260px] whitespace-normal">
                    <div className="flex flex-wrap items-start gap-2">
                      <Button variant="info" size="xs" asChild>
                        <Link href={`/admin/sellers/${app.$id}`}>Details</Link>
                      </Button>
                      <SellerApproveButton sellerProfileId={app.$id} />
                      <SellerRejectForm
                        sellerProfileId={app.$id}
                        shopName={app.shopName}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filterBar}
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Shop
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  Applied
                </TableHead>
                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((row) => (
                <TableRow key={row.$id} className="align-top">
                  <TableCell className="max-w-[420px] whitespace-normal">
                    <Link
                      href={`/admin/sellers/${row.$id}`}
                      className="font-medium tracking-tight hover:text-accent hover:underline hover:underline-offset-2"
                    >
                      {row.shopName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      /shop/{row.slug}
                    </p>
                    {row.bio ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {row.bio}
                      </p>
                    ) : null}
                    {row.status === "rejected" && row.rejectionReason ? (
                      <p className="mt-1.5 text-xs text-rose-700">
                        {row.rejectionReason}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={row.status}
                      tone={statusTone(row.status)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatAppliedAt(row.$createdAt)}
                  </TableCell>
                  <TableCell className="w-[260px] max-w-[260px] whitespace-normal">
                    {row.status === "pending" ? (
                      <div className="flex flex-wrap items-start gap-2">
                        <Button variant="info" size="xs" asChild>
                          <Link href={`/admin/sellers/${row.$id}`}>Details</Link>
                        </Button>
                        <SellerApproveButton sellerProfileId={row.$id} />
                        <SellerRejectForm
                          sellerProfileId={row.$id}
                          shopName={row.shopName}
                        />
                      </div>
                    ) : row.status === "approved" ? (
                      <div className="flex flex-wrap items-start gap-2">
                        <Button variant="info" size="xs" asChild>
                          <Link href={`/admin/sellers/${row.$id}`}>Details</Link>
                        </Button>
                        <Button variant="info" size="xs" asChild>
                          <Link href={`/shop/${row.slug}`}>
                            <ExternalLink data-icon="inline-start" />
                            View shop
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start gap-2">
                        <Button variant="info" size="xs" asChild>
                          <Link href={`/admin/sellers/${row.$id}`}>Details</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                      </div>
                    )}
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
