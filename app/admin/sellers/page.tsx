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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listSellerProfilesForAdminTable,
  type AdminSellerListFilter,
  type AdminSellerRow,
} from "@/lib/services/seller-approvals";
import type { SellerStatus } from "@/lib/types";

type SellerTableRow = AdminSellerRow;

type PageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

function parseFilter(raw: string | undefined): AdminSellerListFilter {
  if (raw === "all") return "all";
  if (raw === "banned") return "banned";
  if (raw === "suspended") return "suspended";
  return "pending";
}

function filterTabHref(filter: AdminSellerListFilter, search: string): string {
  const params = new URLSearchParams();
  if (filter !== "pending") {
    params.set("filter", filter);
  }
  if (search) {
    params.set("q", search);
  }
  const query = params.toString();
  return query ? `/admin/sellers?${query}` : "/admin/sellers";
}

function formatAppliedAt(iso: string | undefined): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "-", time: "" };
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
  if (status === "banned") return "danger";
  return "danger";
}

function shopInitial(shopName: string): string {
  const trimmed = shopName.trim();
  return (trimmed.charAt(0) || "?").toUpperCase();
}

function SellerModerationPills({ row }: { row: SellerTableRow }) {
  return (
    <div className="flex flex-wrap gap-1">
      {row.status === "rejected" ? (
        <StatusPill label="Rejected" tone="danger" />
      ) : null}
      {row.status === "banned" ? (
        <StatusPill label="Banned" tone="danger" />
      ) : null}
      {row.status !== "rejected" && row.status !== "banned" ? (
        <StatusPill label={row.status} tone={statusTone(row.status)} />
      ) : null}
      {row.accountSuspended ? (
        <StatusPill label="Suspended" tone="suspended" />
      ) : null}
    </div>
  );
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
            {showInlineStatus ? <SellerModerationPills row={row} /> : null}
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground">
            /shop/{row.slug}
          </p>
          {row.ownerEmail ? (
            <p className="truncate text-xs text-muted-foreground">
              {row.ownerName ? `${row.ownerName} · ` : ""}
              {row.ownerEmail}
            </p>
          ) : null}
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
          {row.status === "banned" && row.rejectionReason ? (
            <p className="line-clamp-2 text-sm text-rose-700">
              Ban note: {row.rejectionReason}
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
        {row.status === "pending" || row.status === "rejected" ? (
          <>
            <SellerApproveButton sellerProfileId={row.$id} compact />
            {row.status === "pending" ? (
              <SellerRejectForm
                sellerProfileId={row.$id}
                shopName={row.shopName}
                compact
              />
            ) : null}
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
                  <SellerModerationPills row={row} />
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

function emptyMessage(filter: AdminSellerListFilter, search: string): string {
  if (search) {
    return "No sellers match your search.";
  }
  switch (filter) {
    case "pending":
      return "No pending applications. New seller registrations appear here until you approve or reject them.";
    case "banned":
      return "No banned shops. Shops banned from a listing report appear here.";
    case "suspended":
      return "No suspended seller accounts.";
    default:
      return "No sellers yet.";
  }
}

export default async function AdminSellersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = parseFilter(params.filter);
  const search = params.q?.trim().slice(0, 256) ?? "";

  const sellers = await listSellerProfilesForAdminTable({
    filter,
    search: search || undefined,
  });

  const showStatusColumn = filter !== "pending";

  const filterBar = (
    <FilterTabs
      tabs={[
        {
          href: filterTabHref("pending", search),
          label: "Pending",
          active: filter === "pending",
        },
        {
          href: filterTabHref("all", search),
          label: "All sellers",
          active: filter === "all",
        },
        {
          href: filterTabHref("banned", search),
          label: "Banned",
          active: filter === "banned",
        },
        {
          href: filterTabHref("suspended", search),
          label: "Suspended",
          active: filter === "suspended",
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

      <form
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2 sm:max-w-lg"
      >
        {filter !== "pending" ? (
          <input type="hidden" name="filter" value={filter} />
        ) : null}
        <Input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search shop, slug, name, or email"
          aria-label="Search sellers"
          maxLength={256}
          className="h-9 min-w-[12rem] flex-1"
        />
        <Button type="submit" size="sm" variant="info">
          Search
        </Button>
        {search ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={filterTabHref(filter, "")}>Clear</Link>
          </Button>
        ) : null}
      </form>

      <div className="mt-6 space-y-4">
        {filterBar}
        {sellers.length === 0 ? (
          <DataTableEmpty message={emptyMessage(filter, search)} />
        ) : (
          <SellersTable rows={sellers} showStatusColumn={showStatusColumn} />
        )}
      </div>
    </div>
  );
}
