import Link from "next/link";
import {
  DataTableEmpty,
  DataTableShell,
} from "@/components/layout/data-table-shell";
import { PortalPageHeader } from "@/components/layout/portal-page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listSellersWithFlags,
  listVerifiedSellers,
  MAX_SELLERS_EVALUATED,
} from "@/lib/services/trust-signals";

const RULE_LABELS: Record<string, string> = {
  new_seller_high_first_order: "New seller, high first sale",
  open_unresolved_reports: "Open reports",
  rapid_cancellation_rate: "High cancellation rate",
};

function ruleLabel(rule: string): string {
  return RULE_LABELS[rule] ?? rule;
}

export default async function AdminTrustPage() {
  const [flagged, verified] = await Promise.all([
    listSellersWithFlags(),
    listVerifiedSellers(),
  ]);

  return (
    <div className="w-full">
      <PortalPageHeader
        title="Trust signals"
        description="Read-only computed heuristics for human review. Verified badge eligibility and fraud flags are evaluated live from existing data."
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Evaluating up to {MAX_SELLERS_EVALUATED} most recently approved sellers
        per load.
      </p>

      <section className="mt-8">
        <h3 className="text-base font-semibold tracking-tight">
          Flagged sellers
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sellers with one or more triggered risk rules. Use{" "}
          <Link
            href="/admin/sellers"
            className="text-accent underline-offset-2 hover:underline"
          >
            Sellers
          </Link>{" "}
          or{" "}
          <Link
            href="/admin/reports"
            className="text-accent underline-offset-2 hover:underline"
          >
            Reports
          </Link>{" "}
          for follow-up actions.
        </p>

        {flagged.length === 0 ? (
          <DataTableEmpty
            className="mt-4"
            message="No flagged sellers in the current evaluation window."
          />
        ) : (
          <DataTableShell className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Shop
                  </TableHead>
                  <TableHead>
                    Seller ID
                  </TableHead>
                  <TableHead>
                    Flags
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagged.map((row) => (
                  <TableRow key={row.sellerId}>
                    <TableCell className="font-medium">{row.shopName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.sellerId}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <ul className="space-y-2">
                        {row.flags.map((flag) => (
                          <li key={`${row.sellerId}-${flag.rule}`}>
                            <p className="text-xs font-medium text-destructive">
                              {ruleLabel(flag.rule)}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {flag.reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </section>

      <section className="mt-10">
        <h3 className="text-base font-semibold tracking-tight">
          Verified-eligible sellers
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sellers who currently meet all computed Verified badge criteria. This
          is awareness only. No badge is granted or displayed here.
        </p>

        {verified.length === 0 ? (
          <DataTableEmpty
            className="mt-4"
            message="No sellers currently meet Verified eligibility criteria."
          />
        ) : (
          <DataTableShell className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Shop
                  </TableHead>
                  <TableHead>
                    Seller ID
                  </TableHead>
                  <TableHead>
                    Criteria
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verified.map((row) => (
                  <TableRow key={row.sellerId}>
                    <TableCell className="font-medium">{row.shopName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.sellerId}
                    </TableCell>
                    <TableCell className="text-sm whitespace-normal text-muted-foreground">
                      <ul className="list-disc space-y-1 pl-4">
                        {row.verifiedReasons.map((reason) => (
                          <li key={`${row.sellerId}-${reason}`}>{reason}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        )}
      </section>
    </div>
  );
}
