import Link from "next/link";
import {
  UserSuspendForm,
  UserUnsuspendButton,
} from "@/components/admin/user-management-actions";
import {
  DataTableEmpty,
  DataTableShell,
  LoadMoreLink,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { StatusPill } from "@/components/layout/status-pill";
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
import { listBuyers } from "@/lib/services/user-management";

function formatJoinedAt(iso: string | undefined): string {
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
  searchParams: Promise<{ q?: string; cursor?: string }>;
};

export default async function AdminBuyersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const cursor = params.cursor?.trim() ?? undefined;

  const { users, total, nextCursor } = await listBuyers({
    search: search || undefined,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/buyers?${new URLSearchParams({
        ...(search ? { q: search } : {}),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Buyers"
        description="Signed-up buyers. Suspend or unsuspend accounts; suspended buyers cannot sign in or use an existing session."
      />

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2 sm:max-w-md">
        <Input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by name or email"
          aria-label="Search buyers"
          maxLength={256}
          className="h-9 min-w-[12rem] flex-1"
        />
        <Button type="submit" size="sm" variant="info">
          Search
        </Button>
        {search ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href="/admin/buyers">Clear</Link>
          </Button>
        ) : null}
      </form>

      {users.length === 0 ? (
        <DataTableEmpty className="mt-6" message="No buyers found." />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Full name
                </TableHead>
                <TableHead>
                  Email
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  Joined date
                </TableHead>
                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const displayLabel = user.name || user.email || user.userId;
                return (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-xs font-semibold text-foreground uppercase">
                          {displayLabel.charAt(0)}
                        </span>
                        <span className="font-medium tracking-tight">
                          {displayLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground underline decoration-border underline-offset-2">
                      {user.email ?? "-"}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={user.suspended ? "Suspended" : "Active"}
                        tone={user.suspended ? "danger" : "positive"}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatJoinedAt(user.$createdAt)}
                    </TableCell>
                    <TableCell className="w-[260px] max-w-[260px] whitespace-normal">
                      {user.isAdmin ? (
                        <p className="text-xs text-muted-foreground">
                          Admin (cannot suspend)
                        </p>
                      ) : user.suspended ? (
                        <UserUnsuspendButton userId={user.userId} />
                      ) : (
                        <UserSuspendForm
                          userId={user.userId}
                          displayLabel={displayLabel}
                        />
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
