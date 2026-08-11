import Link from "next/link";
import { redirect } from "next/navigation";
import { CartContents } from "@/components/store/cart-contents";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getCart } from "@/lib/services";

export default async function CartPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/cart");
  }

  const cartView = await getCart();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./cart --list</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Your cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One seller per cart. Prices are snapshotted when items are added.
      </p>

      <CartContents cartView={cartView} />

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
