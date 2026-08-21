import { notFound, redirect } from "next/navigation";
import { CodOrderConfirmForm } from "@/components/store/cod-order-confirm-form";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";

type CheckoutContinuationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutCodPage({
  searchParams,
}: CheckoutContinuationPageProps) {
  const { orderId } = await searchParams;
  const user = await getLoggedInUser();
  if (!user) {
    const next = orderId?.trim()
      ? `/checkout/cod?orderId=${encodeURIComponent(orderId.trim())}`
      : "/checkout/cod";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!orderId?.trim()) notFound();

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "cod") notFound();

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "cod") notFound();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --cod</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Confirm cash on delivery
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span>.
        Confirmation checks that you own this order and that stock is available,
        then accepts the order on the server. You will pay cash when the order
        is delivered.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Total due on delivery: {order.currency} {order.totalAmount.toFixed(2)}
      </p>

      <CodOrderConfirmForm order={order} payment={payment} />
    </main>
  );
}
