import type { ReactNode } from "react";
import {
  BuyerAccountMobileNav,
  BuyerAccountNav,
} from "@/components/store/buyer-account-nav";
import { getOwnBuyerCommerceCounts } from "@/lib/services/buyer-commerce-counts";
import { cn } from "@/lib/utils";

type BuyerAccountShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Buyer-only side/mobile nav. Hide for sellers/admins on /account. */
  showBuyerNav?: boolean;
  children: ReactNode;
  className?: string;
};

export async function BuyerAccountShell({
  title,
  description,
  actions,
  showBuyerNav = true,
  children,
  className,
}: BuyerAccountShellProps) {
  const commerce = showBuyerNav ? await getOwnBuyerCommerceCounts() : null;
  const counts = commerce
    ? { wishlist: commerce.wishlist, requests: commerce.requests }
    : undefined;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
        className,
      )}
    >
      {showBuyerNav ? (
        <div className="mb-6 lg:hidden">
          <BuyerAccountMobileNav counts={counts} />
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-8",
          showBuyerNav && "lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10",
        )}
      >
        {showBuyerNav ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border/80 bg-card p-2 shadow-none">
              <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Account
              </p>
              <BuyerAccountNav className="mt-1" counts={counts} />
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {actions}
              </div>
            ) : null}
          </header>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
