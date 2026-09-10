import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DataTableEmpty,
  DataTableShell,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listSellerThreads } from "@/lib/services/threads";

export default async function SellerMessagesPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/seller/messages");

  const { threads, error } = await listSellerThreads();

  return (
    <div>
      <PortalPageHeader
        title="Messages"
        description="Buyer conversations tied to your orders."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/seller/orders">Order inbox</Link>
          </Button>
        }
      />

      {error ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {threads.length === 0 && !error ? (
        <DataTableEmpty className="mt-6" message="No conversations yet." />
      ) : threads.length > 0 ? (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Order</TableHead>
                <TableHead className="px-4 text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threads.map((thread) => (
                <TableRow key={thread.$id}>
                  <TableCell className="px-4 font-mono text-sm">
                    {thread.orderId}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/seller/messages/${thread.$id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      ) : null}
    </div>
  );
}
