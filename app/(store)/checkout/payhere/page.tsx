import { notFound, redirect } from "next/navigation";
import { PayHereCheckoutForm } from "@/components/store/payhere-checkout-form";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";

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

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "payhere") notFound();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --payhere</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Pay with PayHere
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span> ·
        Amount due: {order.currency} {order.totalAmount.toFixed(2)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        You will be redirected to PayHere to complete card payment. Checkout
        fields and hash are signed server-side — never in the browser.
      </p>

      <PayHereCheckoutForm order={order} payment={payment} />
    </main>
  );
}
