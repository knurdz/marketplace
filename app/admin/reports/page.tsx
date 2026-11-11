import Link from "next/link";
import {
  ReportDetails,
  ReportRowActions,
} from "@/components/admin/report-triage-actions";
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
import { listReports, parseReportStatusFilter } from "@/lib/services";
import { reportStatusTone } from "@/lib/ui/status-tone";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/types";

const PAGE_SIZE = 24;

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const EMPTY_COPY: Record<ReportStatus, string> = {
  open: "No open reports. Listing reports from buyers appear here.",
  reviewing: "No reports currently in review.",
  resolved: "No resolved reports yet.",
  dismissed: "No dismissed reports yet.",
};

function formatCreatedAt(iso: string | null): string {
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

type PageProps = {
  searchParams: Promise<{ status?: string; cursor?: string }>;
};

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = parseReportStatusFilter(params.status);
  const cursor = params.cursor?.trim() || undefined;

  const reports = await listReports({
    status,
    limit: PAGE_SIZE,
    cursor,
  });

  const last = reports.at(-1);
  const nextCursor = reports.length === PAGE_SIZE && last ? last.$id : null;

  const nextHref = nextCursor
    ? `/admin/reports?${new URLSearchParams({
        status,
        cursor: nextCursor,
      }).toString()}`
    : null;

  const filterBar = (
    <FilterTabs
      tabs={REPORT_STATUSES.map((value) => ({
        href: `/admin/reports?status=${value}`,
        label: STATUS_LABELS[value],
        active: status === value,
      }))}
    />
  );

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Reports"
        description="Triage listing reports. Take down a listing or ban a shop from here; outcomes are recorded in the audit log."
      />

      {reports.length === 0 ? (
        <div className="mt-6 space-y-4">
          {filterBar}
          <DataTableEmpty message={EMPTY_COPY[status]} />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filterBar}
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Report
                </TableHead>
                <TableHead>
                  Listing
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
              {reports.map((report) => (
                <TableRow key={report.$id} className="align-top">
                  <TableCell className="max-w-[360px] whitespace-normal">
                    <p className="font-medium tracking-tight">{report.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.reporterId} · {formatCreatedAt(report.$createdAt)}
                    </p>
                    <ReportDetails details={report.details} />
                  </TableCell>
                  <TableCell className="max-w-[280px] whitespace-normal">
                    <p className="text-sm">
                      {report.productTitle ?? "Unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.productId}
                      {report.productStatus ? ` · ${report.productStatus}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shop:{" "}
                      {report.shopName?.trim() ||
                        report.sellerId ||
                        "Unknown"}
                    </p>
                    <p className="mt-1 text-xs">
                      <Link
                        href={`/products/${report.productId}`}
                        className="text-accent hover:underline"
                      >
                        View product
                      </Link>
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={STATUS_LABELS[report.status]}
                      tone={reportStatusTone(report.status)}
                    />
                  </TableCell>
                  <TableCell className="w-[280px] max-w-[320px] whitespace-normal">
                    <ReportRowActions
                      reportId={report.$id}
                      status={report.status}
                      productId={report.productId}
                      productTitle={report.productTitle}
                      productStatus={report.productStatus}
                      sellerId={report.sellerId}
                      shopName={report.shopName}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
          {nextHref ? <LoadMoreLink href={nextHref} /> : null}
        </div>
      )}
    </div>
  );
}
