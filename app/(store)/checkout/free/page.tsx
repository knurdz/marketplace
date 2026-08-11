import { notFound, redirect } from "next/navigation";
import { FreeOrderConfirmForm } from "@/components/store/free-order-confirm-form";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";

type CheckoutContinuationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutFreePage({
  searchParams,
}: CheckoutContinuationPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/checkout/free");
  }

  const { orderId } = await searchParams;
  if (!orderId?.trim()) notFound();

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "free") notFound();

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "free") notFound();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --free</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Confirm free order
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span>.
        Confirmation runs through the Member 1 free-confirm API — payment is
        marked paid only after server-side verification.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Total: {order.currency} {order.totalAmount.toFixed(2)}
      </p>

      <FreeOrderConfirmForm order={order} payment={payment} />
    </main>
  );
}
