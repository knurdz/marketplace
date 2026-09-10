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
import { listUsers } from "@/lib/services";

function formatJoinedAt(iso: string | undefined): string {
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

function formatLabels(labels: string[]): string {
  if (labels.length === 0) return "—";
  return labels.join(", ");
}

type PageProps = {
  searchParams: Promise<{ q?: string; cursor?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const cursor = params.cursor?.trim() ?? undefined;

  const { users, total, nextCursor } = await listUsers({
    search: search || undefined,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/users?${new URLSearchParams({
        ...(search ? { q: search } : {}),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <PortalPageHeader
        title="User management"
        description="Suspend or unsuspend accounts. Suspended users cannot sign in or use an existing session."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form method="get" className="flex flex-1 flex-wrap gap-2 sm:max-w-md">
          <Input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by name or email"
            aria-label="Search users"
            maxLength={256}
            className="h-9 min-w-[12rem] flex-1"
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
          {search ? (
            <Button size="sm" variant="ghost" asChild>
              <Link href="/admin/users">Clear</Link>
            </Button>
          ) : null}
        </form>
        <p className="font-mono text-xs text-muted-foreground">
          {total} user{total === 1 ? "" : "s"}
          {search ? ` matching “${search}”` : ""}
        </p>
      </div>

      {users.length === 0 ? (
        <DataTableEmpty className="mt-6" message="No users found." />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">User</TableHead>
                <TableHead className="px-4">Roles</TableHead>
                <TableHead className="px-4">Joined</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const displayLabel = user.name || user.email || user.userId;
                return (
                  <TableRow key={user.userId} className="align-top">
                    <TableCell className="px-4 py-3">
                      <p className="font-medium tracking-tight">{displayLabel}</p>
                      {user.email ? (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatLabels(user.labels)}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatJoinedAt(user.$createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill
                        label={user.suspended ? "Suspended" : "Active"}
                        tone={user.suspended ? "danger" : "positive"}
                      />
                    </TableCell>
                    <TableCell className="w-[260px] max-w-[260px] px-4 py-3 whitespace-normal">
                      {user.isAdmin ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          Admin — cannot suspend
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
