import Link from "next/link";
import {
  AdminAccountRowActions,
  AdminCreateForm,
} from "@/components/admin/admin-accounts-manager";
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
import { requireSuperAdmin } from "@/lib/security/super-admin";
import { listAdminAccounts } from "@/lib/services/admin-accounts";

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

export default async function AdminAdminsPage({ searchParams }: PageProps) {
  const actor = await requireSuperAdmin();
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const cursor = params.cursor?.trim() ?? undefined;

  const { admins, nextCursor } = await listAdminAccounts({
    search: search || undefined,
    cursor,
  });

  const nextHref = nextCursor
    ? `/admin/admins?${new URLSearchParams({
        ...(search ? { q: search } : {}),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Admins"
        description="Create platform admins, block sign-in, or remove accounts. Only the superadmin can use this page."
      />

      <AdminCreateForm />

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2 sm:max-w-md">
        <Input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by name or email"
          aria-label="Search admins"
          maxLength={256}
          className="h-9 min-w-[12rem] flex-1"
        />
        <Button type="submit" size="sm" variant="info">
          Search
        </Button>
        {search ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href="/admin/admins">Clear</Link>
          </Button>
        ) : null}
      </form>

      {admins.length === 0 ? (
        <DataTableEmpty className="mt-6" message="No admins found." />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => {
                const displayLabel = admin.name || admin.email || admin.userId;
                return (
                  <TableRow key={admin.userId}>
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
                      {admin.email ?? "-"}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={admin.isSuperAdmin ? "Superadmin" : "Admin"}
                        tone={admin.isSuperAdmin ? "info" : "neutral"}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={admin.suspended ? "Blocked" : "Active"}
                        tone={admin.suspended ? "danger" : "positive"}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatJoinedAt(admin.$createdAt)}
                    </TableCell>
                    <TableCell className="w-[280px] max-w-[280px] whitespace-normal">
                      <AdminAccountRowActions
                        admin={admin}
                        actorUserId={actor.$id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {nextHref ? <LoadMoreLink href={nextHref} /> : null}
        </DataTableShell>
      )}
    </div>
  );
}
