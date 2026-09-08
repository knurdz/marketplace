import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/store/checkout-form";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { debugLog9ec1e5 } from "@/lib/debug-9ec1e5";
import { getCart } from "@/lib/services";
import { isPayHereCheckoutEnabled } from "@/lib/services/platform-settings";

export default async function CheckoutPage() {
  const user = await getLoggedInUser();
  if (!user) {
    // #region agent log
    await debugLog9ec1e5({
      hypothesisId: "G",
      location: "app/(store)/checkout/page.tsx",
      message: "checkout redirect unauthenticated",
      data: { hasUser: false },
    });
    // #endregion
    redirect("/login?next=/checkout");
  }

  const cartView = await getCart();
  const payhereEnabled = await isPayHereCheckoutEnabled();

  // #region agent log
  await debugLog9ec1e5({
    hypothesisId: "H",
    location: "app/(store)/checkout/page.tsx",
    message: "checkout page rendered",
    data: {
      lineCount: cartView.lines.length,
      hasIssues: cartView.hasIssues,
      hasSellerId: Boolean(cartView.cart?.sellerId),
      payhereEnabled,
      empty: cartView.lines.length === 0,
    },
  });
  // #endregion

  if (cartView.lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <PageHeader title="Checkout" />
        <EmptyState
          className="mt-10"
          title="Your cart is empty"
          action={
            <Button asChild>
              <Link href="/market">Browse listings</Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Checkout"
        title="Place order"
        description="Enter your shipping address and choose how you will pay. Totals are confirmed on the server."
      />
      <div className="mt-10">
        <CheckoutForm cartView={cartView} payhereEnabled={payhereEnabled} />
      </div>
    </main>
  );
}
