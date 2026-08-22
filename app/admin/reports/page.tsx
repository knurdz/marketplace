import Link from "next/link";
import {
  ReportDetails,
  ReportRowActions,
} from "@/components/admin/report-triage-actions";
import { listReports, parseReportStatusFilter } from "@/lib/services";
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
  if (!iso) return "—";
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

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Reports</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Triage listing reports. Resolving or dismissing records the outcome in
        the audit log; take down a listing from Listings if needed.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2 font-mono text-sm">
        {REPORT_STATUSES.map((value) => {
          const href = `/admin/reports?status=${value}`;
          const active = status === value;
          return (
            <Link
              key={value}
              href={href}
              className={
                active
                  ? "rounded-md border border-border bg-card px-3 py-2 font-bold"
                  : "rounded-md border border-transparent px-3 py-2 text-muted-foreground hover:border-border"
              }
            >
              {STATUS_LABELS[value]}
            </Link>
          );
        })}
      </nav>

      {reports.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          {EMPTY_COPY[status]}
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {reports.map((report) => (
            <li
              key={report.$id}
              className="rounded-md border border-border bg-card px-4 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold tracking-tight">
                    {report.reason}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Reporter: {report.reporterId}
                  </p>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatCreatedAt(report.$createdAt)}
                </p>
              </div>

              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Listing: {report.productTitle ?? "Unavailable"}
                {report.productStatus ? ` · ${report.productStatus}` : null}
                {" · "}
                {report.productId}
                {" · "}
                <Link
                  href={`/products/${report.productId}`}
                  className="text-accent hover:underline"
                >
                  View product
                </Link>
                {" · "}
                <Link
                  href="/admin/listings"
                  className="text-accent hover:underline"
                >
                  Listings
                </Link>
              </p>

              <ReportDetails details={report.details} />

              <div className="mt-4">
                <ReportRowActions
                  reportId={report.$id}
                  status={report.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
