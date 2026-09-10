import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/store/checkout-form";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getCart } from "@/lib/services";
import { isPayHereCheckoutEnabled } from "@/lib/services/platform-settings";

export default async function CheckoutPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  const cartView = await getCart();
  const payhereEnabled = await isPayHereCheckoutEnabled();

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
