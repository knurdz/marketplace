import Link from "next/link";
import {
  SellerApproveButton,
  SellerRejectForm,
} from "@/components/admin/seller-approval-actions";
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
import { listPendingSellerApplications } from "@/lib/services";

function formatAppliedAt(iso: string | undefined): string {
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

export default async function AdminSellersPage() {
  const pending = await listPendingSellerApplications();

  return (
    <div>
      <PortalPageHeader
        title="Seller approvals"
        description="Review pending applications. Approving grants the seller label and unlocks the seller portal."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/sellers/performance">Performance</Link>
          </Button>
        }
      />

      {pending.length === 0 ? (
        <DataTableEmpty
          className="mt-6"
          message="No pending applications. New seller registrations appear here until you approve or reject them."
        />
      ) : (
        <DataTableShell className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Shop</TableHead>
                <TableHead className="px-4">Bank</TableHead>
                <TableHead className="px-4">Applied</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((app) => (
                <TableRow key={app.$id} className="align-top">
                  <TableCell className="max-w-[420px] px-4 py-3 whitespace-normal">
                    <p className="font-medium tracking-tight">{app.shopName}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      /shop/{app.slug}
                    </p>
                    {app.bio ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {app.bio}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {app.bankName ?? "—"}
                    {app.maskedBankAccountNumber ? (
                      <span className="block">
                        {app.maskedBankAccountNumber}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {formatAppliedAt(app.$createdAt)}
                  </TableCell>
                  <TableCell className="w-[260px] max-w-[260px] px-4 py-3 whitespace-normal">
                    <div className="flex flex-wrap items-start gap-2">
                      <SellerApproveButton sellerProfileId={app.$id} />
                      <SellerRejectForm
                        sellerProfileId={app.$id}
                        shopName={app.shopName}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
