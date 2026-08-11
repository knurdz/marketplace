import Link from "next/link";
import {
  UserSuspendForm,
  UserUnsuspendButton,
} from "@/components/admin/user-management-actions";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./admin --users</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">User management</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        View platform users and suspend or unsuspend accounts. Suspended users
        cannot sign in or use an existing session.
      </p>

      <form method="get" className="mt-8 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by name or email"
          maxLength={256}
          className="min-w-[12rem] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" variant="outline">
          Search
        </Button>
        {search ? (
          <Link
            href="/admin/users"
            className="inline-flex items-center rounded-md border border-border px-3 py-2 font-mono text-xs text-muted-foreground hover:bg-muted"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        {total} user{total === 1 ? "" : "s"}
        {search ? ` matching “${search}”` : ""}
      </p>

      {users.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          No users found.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {users.map((user) => {
            const displayLabel = user.name || user.email || user.userId;
            return (
              <li
                key={user.userId}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tracking-tight">
                      {displayLabel}
                    </p>
                    {user.email ? (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={
                      user.suspended
                        ? "font-mono text-xs text-destructive"
                        : "font-mono text-xs text-muted-foreground"
                    }
                  >
                    {user.suspended ? "Suspended" : "Active"}
                  </span>
                </div>

                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Roles: {formatLabels(user.labels)}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Joined {formatJoinedAt(user.$createdAt)}
                </p>

                <div className="mt-4">
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
                </div>
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
