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
  type AdminSellerRow,
} from "@/lib/services/seller-approvals";
import type { SellerStatus } from "@/lib/types";

type SellersFilter = "all" | "pending";

type SellerTableRow = {
  $id: string;
  shopName: string;
  slug: string;
  bio: string | null;
  status: SellerStatus;
  rejectionReason?: string | null;
  $createdAt?: string;
};

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function parseFilter(raw: string | undefined): SellersFilter {
  return raw === "all" ? "all" : "pending";
}

function formatAppliedAt(iso: string | undefined): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "—", time: "" };
  try {
    const when = new Date(iso);
    return {
      date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        when,
      ),
      time: new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
        when,
      ),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function statusTone(status: SellerStatus): StatusTone {
  if (status === "approved") return "positive";
  if (status === "pending") return "warning";
  return "danger";
}

function toTableRow(
  row: AdminSellerRow | Awaited<ReturnType<typeof listPendingSellerApplications>>[number],
): SellerTableRow {
  return {
    $id: row.$id,
    shopName: row.shopName,
    slug: row.slug,
    bio: row.bio,
    status: row.status,
    rejectionReason:
      "rejectionReason" in row ? row.rejectionReason : null,
    $createdAt: row.$createdAt,
  };
}

function shopInitial(shopName: string): string {
  const trimmed = shopName.trim();
  return (trimmed.charAt(0) || "?").toUpperCase();
}

function SellerShopCell({
  row,
  showInlineStatus,
}: {
  row: SellerTableRow;
  showInlineStatus: boolean;
}) {
  return (
    <TableCell className="max-w-lg whitespace-normal py-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted text-sm font-semibold text-foreground"
        >
          {shopInitial(row.shopName)}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/sellers/${row.$id}`}
              className="text-sm font-semibold tracking-tight hover:text-accent hover:underline hover:underline-offset-2"
            >
              {row.shopName}
            </Link>
            {showInlineStatus ? (
              <StatusPill
                label={row.status}
                tone={statusTone(row.status)}
              />
            ) : null}
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground">
            /shop/{row.slug}
          </p>
          {row.bio ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {row.bio}
            </p>
          ) : null}
          {row.status === "rejected" && row.rejectionReason ? (
            <p className="line-clamp-2 text-sm text-rose-700">
              {row.rejectionReason}
            </p>
          ) : null}
        </div>
      </div>
    </TableCell>
  );
}

function SellerAppliedCell({ row }: { row: SellerTableRow }) {
  const { date, time } = formatAppliedAt(row.$createdAt);
  return (
    <TableCell className="w-[1%] py-3 whitespace-nowrap align-top">
      <p className="text-sm font-medium text-foreground tabular-nums">{date}</p>
      {time ? (
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          {time}
        </p>
      ) : null}
    </TableCell>
  );
}

function SellerActionsCell({ row }: { row: SellerTableRow }) {
  return (
    <TableCell className="w-[1%] py-3 whitespace-nowrap align-top">
      <div className="flex flex-nowrap items-center gap-1.5">
        <Button variant="info" size="xs" asChild>
          <Link href={`/admin/sellers/${row.$id}`}>Details</Link>
        </Button>
        {row.status === "pending" ? (
          <>
            <SellerApproveButton sellerProfileId={row.$id} compact />
            <SellerRejectForm
              sellerProfileId={row.$id}
              shopName={row.shopName}
              compact
            />
          </>
        ) : row.status === "approved" ? (
          <Button variant="info" size="xs" asChild>
            <Link href={`/shop/${row.slug}`}>
              <ExternalLink data-icon="inline-start" />
              View shop
            </Link>
          </Button>
        ) : null}
      </div>
    </TableCell>
  );
}

function SellersTable({
  rows,
  showStatusColumn,
}: {
  rows: SellerTableRow[];
  showStatusColumn: boolean;
}) {
  return (
    <DataTableShell>
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[16rem]">Shop</TableHead>
            {showStatusColumn ? (
              <TableHead className="w-[1%] whitespace-nowrap">Status</TableHead>
            ) : null}
            <TableHead className="w-[1%] whitespace-nowrap">Applied</TableHead>
            <TableHead className="w-[1%] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.$id}>
              <SellerShopCell
                row={row}
                showInlineStatus={!showStatusColumn}
              />
              {showStatusColumn ? (
                <TableCell className="w-[1%] py-3 whitespace-nowrap align-top">
                  <StatusPill
                    label={row.status}
                    tone={statusTone(row.status)}
                  />
                </TableCell>
              ) : null}
              <SellerAppliedCell row={row} />
              <SellerActionsCell row={row} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}

export default async function AdminSellersPage({ searchParams }: PageProps) {
  const { filter: filterRaw } = await searchParams;
  const filter = parseFilter(filterRaw);

  const rawSellers =
    filter === "pending"
      ? await listPendingSellerApplications()
      : await listSellerProfilesAdmin();
  const sellers = rawSellers.map((row) => toTableRow(row));

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

      <div className="mt-6 space-y-4">
        {filterBar}
        {sellers.length === 0 ? (
          <DataTableEmpty
            message={
              filter === "pending"
                ? "No pending applications. New seller registrations appear here until you approve or reject them."
                : "No sellers yet."
            }
          />
        ) : (
          <SellersTable
            rows={sellers}
            showStatusColumn={filter === "all"}
          />
        )}
      </div>
    </div>
  );
}
