import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/store/checkout-form";
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
      <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
        <p className="font-mono text-sm text-accent">$ ./checkout --init</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
        <p className="mt-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Browse listings</Link>
          </Button>
        </p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --init</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your shipping address and choose how you will pay. Totals are
        confirmed on the server when your order is placed.
      </p>

      <CheckoutForm cartView={cartView} payhereEnabled={payhereEnabled} />
    </main>
  );
}
