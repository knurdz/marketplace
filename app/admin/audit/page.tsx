import Link from "next/link";
import {
  DataTableEmpty,
  DataTableShell,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAuditLogs, parseAuditLogFilter } from "@/lib/services";

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
    <div>
      <PortalPageHeader
        title="Audit log"
        description="Read-only history of admin actions. Append-only. No edits or deletions from this view."
      />

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="grid min-w-[12rem] gap-1.5">
          <Label htmlFor="actorId" className="font-mono text-xs text-muted-foreground">
            Actor ID
          </Label>
          <Input
            id="actorId"
            type="text"
            name="actorId"
            defaultValue={actorId ?? ""}
            placeholder="User ID"
            className="h-9 text-sm"
          />
        </div>

        <div className="grid min-w-[12rem] gap-1.5">
          <Label htmlFor="event" className="font-mono text-xs text-muted-foreground">
            Event
          </Label>
          <Input
            id="event"
            type="text"
            name="event"
            defaultValue={event ?? ""}
            placeholder="e.g. seller.approved"
            className="h-9 text-sm"
          />
        </div>

        <div className="grid min-w-[10rem] gap-1.5">
          <Label
            htmlFor="resourceType"
            className="font-mono text-xs text-muted-foreground"
          >
            Resource type
          </Label>
          <Input
            id="resourceType"
            type="text"
            name="resourceType"
            defaultValue={resourceType ?? ""}
            placeholder="e.g. seller_profile"
            className="h-9 text-sm"
          />
        </div>

        <div className="grid min-w-[12rem] gap-1.5">
          <Label
            htmlFor="resourceId"
            className="font-mono text-xs text-muted-foreground"
          >
            Resource ID
          </Label>
          <Input
            id="resourceId"
            type="text"
            name="resourceId"
            defaultValue={resourceId ?? ""}
            placeholder="Resource ID"
            className="h-9 text-sm"
          />
        </div>

        <Button type="submit" size="sm" variant="outline">
          Apply filters
        </Button>

        {hasFilters ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/audit">Clear</Link>
          </Button>
        ) : null}
      </form>

      {entries.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message={
            hasFilters
              ? "No audit entries match the selected filters."
              : "No audit entries yet. Admin actions from seller approval, moderation, bank slip review, and settings will appear here."
          }
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">When</TableHead>
                <TableHead className="px-4">Event</TableHead>
                <TableHead className="px-4">Actor</TableHead>
                <TableHead className="px-4">Resource</TableHead>
                <TableHead className="px-4">IP</TableHead>
                <TableHead className="px-4">Meta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const meta = formatMetaDisplay(entry.meta);
                return (
                  <TableRow key={entry.$id}>
                    <TableCell className="px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatCreatedAt(entry.$createdAt)}
                    </TableCell>
                    <TableCell className="px-4 font-medium">{entry.event}</TableCell>
                    <TableCell className="px-4 font-mono text-xs">
                      {entry.actorId ?? "system"}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal font-mono text-xs text-muted-foreground">
                      {entry.resourceType}
                      {entry.resourceId ? ` · ${entry.resourceId}` : ""}
                    </TableCell>
                    <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                      {entry.ip ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal">
                      {meta.kind === "empty" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <details>
                          <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
                            Meta
                          </summary>
                          <pre className="mt-2 max-h-64 max-w-md overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                            {meta.content}
                          </pre>
                        </details>
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
