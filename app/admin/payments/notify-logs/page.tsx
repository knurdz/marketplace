import Link from "next/link";
import {
  listNotifyLogs,
  parseNotifyLogCursor,
  parseNotifyLogView,
  type NotifyLogOutcome,
  type NotifyLogSource,
  type NotifyLogView,
} from "@/lib/services";

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

  const showEmpty = entries.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        PayHere notify logs
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Read-only view of <code className="font-mono text-xs">payhere-notify</code>{" "}
        Function execution logs. Signatures, merchant secret, and card data are
        redacted. This does not change payment state.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2 font-mono text-sm">
        {VIEW_TABS.map((tab) => {
          const href = `/admin/payments/notify-logs?view=${tab.value}`;
          const active = view === tab.value;
          return (
            <Link
              key={tab.value}
              href={href}
              className={
                active
                  ? "rounded-md border border-accent bg-accent/10 px-3 py-1.5 text-accent"
                  : "rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-muted"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {showEmpty ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          {view === "issues" && source === "ready"
            ? "No ignored, rejected, or failed notify executions on this page."
            : SOURCE_EMPTY[source]}
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {entries.map((entry) => {
            const details = [entry.logs, entry.errors]
              .filter((part) => part.trim().length > 0)
              .join("\n");
            return (
              <li
                key={entry.$id}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {entry.$id}
                    </p>
                    <p className="mt-1 text-lg font-bold tracking-tight">
                      {OUTCOME_LABELS[entry.outcome]}
                      {entry.isIssue ? (
                        <span className="ml-2 font-mono text-xs font-normal text-accent">
                          issue
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatCreatedAt(entry.$createdAt)}
                  </p>
                </div>

                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Execution: {entry.executionStatus} · HTTP{" "}
                  {entry.responseStatusCode} · {entry.requestMethod} ·{" "}
                  {entry.trigger} · {formatDuration(entry.duration)}
                </p>

                {entry.orderId ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Order: {entry.orderId}
                    {entry.statusCode ? ` · PayHere status ${entry.statusCode}` : ""}
                    {entry.reason ? ` · reason ${entry.reason}` : ""}
                  </p>
                ) : entry.reason ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Reason: {entry.reason}
                  </p>
                ) : null}

                {details ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
                      Logs
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                      {details}
                    </pre>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8">
          <Link
            href={nextHref}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-muted"
          >
            Next page →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
