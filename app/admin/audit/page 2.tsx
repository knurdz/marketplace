import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  listAuditLogs,
  parseAuditLogFilter,
} from "@/lib/services";

const PAGE_SIZE = 25;

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

function buildFilterHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/audit?${qs}` : "/admin/audit";
}

function formatMetaDisplay(meta: string | null): {
  kind: "json" | "raw" | "empty";
  content: string;
} {
  if (!meta) {
    return { kind: "empty", content: "" };
  }
  try {
    const parsed = JSON.parse(meta) as unknown;
    return {
      kind: "json",
      content: JSON.stringify(parsed, null, 2),
    };
  } catch {
    return { kind: "raw", content: meta };
  }
}

type PageProps = {
  searchParams: Promise<{
    actorId?: string;
    event?: string;
    resourceType?: string;
    resourceId?: string;
    cursor?: string;
  }>;
};

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const actorId = parseAuditLogFilter(params.actorId);
  const event = parseAuditLogFilter(params.event);
  const resourceType = parseAuditLogFilter(params.resourceType);
  const resourceId = parseAuditLogFilter(params.resourceId);
  const cursor = parseAuditLogFilter(params.cursor);

  const { entries, nextCursor } = await listAuditLogs({
    actorId,
    event,
    resourceType,
    resourceId,
    limit: PAGE_SIZE,
    cursor,
  });

  const hasFilters = Boolean(actorId || event || resourceType || resourceId);
  const clearHref = "/admin/audit";

  const nextHref = nextCursor
    ? buildFilterHref({
        actorId,
        event,
        resourceType,
        resourceId,
        cursor: nextCursor,
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./admin --audit</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Audit log</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Read-only history of admin actions. Append-only — no edits or deletions
        from this view.
      </p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Actor ID
          <input
            type="text"
            name="actorId"
            defaultValue={actorId ?? ""}
            placeholder="User ID"
            className="min-w-[12rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Event
          <input
            type="text"
            name="event"
            defaultValue={event ?? ""}
            placeholder="e.g. seller.approved"
            className="min-w-[12rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Resource type
          <input
            type="text"
            name="resourceType"
            defaultValue={resourceType ?? ""}
            placeholder="e.g. seller_profile"
            className="min-w-[10rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          Resource ID
          <input
            type="text"
            name="resourceId"
            defaultValue={resourceId ?? ""}
            placeholder="Resource ID"
            className="min-w-[12rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <Button type="submit" size="sm" variant="outline">
          Apply filters
        </Button>

        {hasFilters ? (
          <Link
            href={clearHref}
            className="inline-flex items-center rounded-md border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:bg-muted"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {entries.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          {hasFilters
            ? "No audit entries match the selected filters."
            : "No audit entries yet. Admin actions from seller approval, moderation, bank slip review, and settings will appear here."}
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {entries.map((entry) => {
            const meta = formatMetaDisplay(entry.meta);
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
                      {entry.event}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatCreatedAt(entry.$createdAt)}
                  </p>
                </div>

                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Actor: {entry.actorId ?? "system"}
                </p>

                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Resource: {entry.resourceType}
                  {entry.resourceId ? ` · ${entry.resourceId}` : ""}
                </p>

                {entry.ip ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    IP: {entry.ip}
                  </p>
                ) : null}

                {meta.kind !== "empty" ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
                      Meta
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                      {meta.content}
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
