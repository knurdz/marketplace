import Link from "next/link";
import {
  SellerApproveButton,
  SellerRejectForm,
} from "@/components/admin/seller-approval-actions";
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
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./admin --sellers</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        Seller approvals
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Review pending applications. Approving grants the seller label and
        unlocks the seller portal.{" "}
        <Link
          href="/admin/sellers/performance"
          className="text-accent underline-offset-2 hover:underline"
        >
          Approved seller performance
        </Link>
      </p>

      {pending.length === 0 ? (
        <p className="mt-10 rounded-md border border-border bg-card px-4 py-5 font-mono text-sm text-muted-foreground">
          No pending applications. When buyers apply via the seller portal,
          they will appear here.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {pending.map((app) => (
            <li
              key={app.$id}
              className="rounded-md border border-border bg-card px-4 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold tracking-tight">
                    {app.shopName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    /shop/{app.slug}
                  </p>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  Applied {formatAppliedAt(app.$createdAt)}
                </p>
              </div>

              {app.bio ? (
                <p className="mt-3 text-sm text-muted-foreground">{app.bio}</p>
              ) : null}

              {app.bankName || app.maskedBankAccountNumber ? (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Bank: {app.bankName ?? "—"}
                  {app.maskedBankAccountNumber
                    ? ` · ${app.maskedBankAccountNumber}`
                    : null}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-start gap-3">
                <SellerApproveButton sellerProfileId={app.$id} />
                <SellerRejectForm
                  sellerProfileId={app.$id}
                  shopName={app.shopName}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
