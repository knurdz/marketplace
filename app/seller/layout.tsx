import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  PortalShell,
  type PortalNavGroup,
} from "@/components/layout/portal-shell";
import { redirectIfRegistrationIncomplete } from "@/lib/backend/registration-complete";
import {
  getRequestPathname,
  pathIsSellerPendingRoute,
} from "@/lib/backend/request-pathname";
import { ROLE_LABELS, requireUser, userHasLabel } from "@/lib/backend/roles";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { getSellerMetrics } from "@/lib/services/seller-metrics";
import {
  blockedSellerPortalDestination,
  getOwnSellerProfile,
} from "@/lib/services/seller-application";

export const metadata: Metadata = buildNoIndexMetadata("Seller Portal");

function buildSellerNav(openRequests: boolean): PortalNavGroup[] {
  return [
    {
      items: [{ href: "/seller", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Shop",
      items: [
        { href: "/seller/shop", label: "Shop", icon: "shop" },
        { href: "/seller/listings", label: "Listings", icon: "listings" },
      ],
    },
    {
      title: "Sales",
      items: [
        {
          href: "/seller/requests",
          label: "Requests",
          icon: "orders",
          showDot: openRequests,
        },
        { href: "/seller/reviews", label: "Reviews", icon: "reviews" },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/seller/settings", label: "Settings", icon: "settings" }],
    },
  ];
}

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const pathname = await getRequestPathname();
  await redirectIfRegistrationIncomplete(pathname);
  const hasSellerLabel = userHasLabel(user, ROLE_LABELS.seller);
  const isPendingPage = pathIsSellerPendingRoute(pathname);
  const profile = await getOwnSellerProfile();
  const hasApprovedSellerAccess =
    hasSellerLabel && profile?.status === "approved";

  if (hasApprovedSellerAccess) {
    if (isPendingPage) {
      redirect("/seller");
    }
    const { openCount } = await getSellerMetrics();
    return (
      <PortalShell
        title="Seller"
        homeHref="/seller"
        nav={buildSellerNav(openCount > 0)}
      >
        {children}
      </PortalShell>
    );
  }

  if (isPendingPage) {
    return children;
  }

  const dest = blockedSellerPortalDestination(hasSellerLabel, profile);
  if (dest) {
    // When the proxy pathname header is missing, avoid redirecting to the same URL.
    if (dest === "/seller/pending" && !pathname) {
      return children;
    }
    redirect(dest);
  }
  redirect("/");
}
