import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder } from "@/lib/services/orders";

type CheckoutContinuationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutPayHerePage({
  searchParams,
}: CheckoutContinuationPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/checkout/payhere");
  }

  const { orderId } = await searchParams;
  if (!orderId?.trim()) notFound();

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "payhere") notFound();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --payhere</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Pay with PayHere
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span> was
        created. PayHere checkout redirect and return/cancel polling land in
        step 2.9 via <code className="font-mono text-sm">requestPayHereCheckout</code>.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Status: {order.status} · Total: {order.currency}{" "}
        {order.totalAmount.toFixed(2)}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" disabled>
          Continue to PayHere (step 2.9)
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </div>
    </main>
  );
}
