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
import {
  listNotifyLogs,
  parseNotifyLogCursor,
  parseNotifyLogView,
  type NotifyLogOutcome,
  type NotifyLogSource,
  type NotifyLogView,
} from "@/lib/services";
import { notifyLogOutcomeTone } from "@/lib/ui/status-tone";

const PAGE_SIZE = 25;

const VIEW_TABS: { value: NotifyLogView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "issues", label: "Issues" },
];

const OUTCOME_LABELS: Record<NotifyLogOutcome, string> = {
  ignored: "Ignored",
  rejected: "Rejected",
  payment_failed: "Payment failed",
  settle_failed: "Settle failed",
  already_paid: "Already paid",
  settled: "Settled",
  noop: "No-op",
  refunded: "Refunded",
  config_error: "Config error",
  error: "Error",
  unknown: "Unknown",
};

const SOURCE_EMPTY: Record<NotifyLogSource, string> = {
  ready: "No notify logs match this filter.",
  empty:
    "No notify log rows yet. Ignored, rejected, and failed callbacks will appear here after payhere-notify runs.",
  not_configured:
    "Admin API is not configured on this server, so notify logs cannot be read.",
  not_deployed:
    "Neither payhere_notify_logs nor the payhere-notify Function is available in this project. After the table exists and notify runs, ignored, rejected, and failed callbacks appear here. Merchant secret, hash, and card data are never shown.",
  unavailable:
    "Could not read notify logs. Confirm APPWRITE_API_KEY can read TablesDB (payhere_notify_logs) or Function executions. No secrets are displayed on this page.",
};

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  return `${seconds.toFixed(2)} s`;
}

type PageProps = {
  searchParams: Promise<{ view?: string; cursor?: string }>;
};

export default async function AdminNotifyLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = parseNotifyLogView(params.view);
  const cursor = parseNotifyLogCursor(params.cursor);

  const { source, entries, nextCursor } = await listNotifyLogs({
    view,
    limit: PAGE_SIZE,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/payments/notify-logs?${new URLSearchParams({
        view,
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <PortalPageHeader
        title="PayHere notify logs"
        description="Read-only view of payhere-notify Function execution logs. Signatures, merchant secret, and card data are redacted. This does not change payment state."
      />

      <FilterTabs
        className="mt-6"
        tabs={VIEW_TABS.map((tab) => ({
          href: `/admin/payments/notify-logs?view=${tab.value}`,
          label: tab.label,
          active: view === tab.value,
        }))}
      />

      {entries.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message={
            view === "issues" && source === "ready"
              ? "No ignored, rejected, or failed notify executions on this page."
              : SOURCE_EMPTY[source]
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">When</TableHead>
                <TableHead className="px-4">Outcome</TableHead>
                <TableHead className="px-4">Order</TableHead>
                <TableHead className="px-4">Execution</TableHead>
                <TableHead className="px-4">Duration</TableHead>
                <TableHead className="px-4">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const details = [entry.logs, entry.errors]
                  .filter((part) => part.trim().length > 0)
                  .join("\n");
                return (
                  <TableRow key={entry.$id}>
                    <TableCell className="px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatCreatedAt(entry.$createdAt)}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill
                          label={OUTCOME_LABELS[entry.outcome]}
                          tone={notifyLogOutcomeTone(entry.outcome)}
                        />
                        {entry.isIssue ? (
                          <span className="font-mono text-[11px] text-accent">
                            issue
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal font-mono text-xs text-muted-foreground">
                      {entry.orderId
                        ? `${entry.orderId}${
                            entry.statusCode
                              ? ` · PayHere ${entry.statusCode}`
                              : ""
                          }${entry.reason ? ` · ${entry.reason}` : ""}`
                        : entry.reason
                          ? `Reason: ${entry.reason}`
                          : "—"}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal font-mono text-xs text-muted-foreground">
                      {entry.executionStatus} · HTTP {entry.responseStatusCode} ·{" "}
                      {entry.requestMethod} · {entry.trigger}
                    </TableCell>
                    <TableCell className="px-4 font-mono text-xs tabular-nums">
                      {formatDuration(entry.duration)}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal">
                      {details ? (
                        <details>
                          <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
                            Logs
                          </summary>
                          <pre className="mt-2 max-h-64 max-w-md overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                            {details}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableShell>
      )}

      {nextHref ? <LoadMoreLink href={nextHref} label="Next page" /> : null}
    </div>
  );
}
