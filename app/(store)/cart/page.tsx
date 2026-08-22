import Link from "next/link";
import { redirect } from "next/navigation";
import { CartContents } from "@/components/store/cart-contents";
import { PageHeader } from "@/components/layout/page-header";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Checkout"
        title="Your cart"
        description="One seller per cart. Prices are snapshotted when items are added."
      />

      <div className="mt-10">
        <CartContents cartView={cartView} />
      </div>

      <p className="mt-12">
        <Button variant="secondary" asChild>
          <Link href="/market">Continue shopping</Link>
        </Button>
      </p>
    </main>
  );
}
