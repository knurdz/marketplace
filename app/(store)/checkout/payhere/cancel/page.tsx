import { notFound, redirect } from "next/navigation";
import { PayHerePaymentStatus } from "@/components/store/payhere-payment-status";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";

/**
 * PayHere cancel landing page.
 * Member 1 hash Function sets cancel_url to:
 *   {APP_URL}/checkout/payhere/cancel?orderId={orders.$id}
 * PayHere redirect query params are NOT trusted — we still poll DB in case
 * notify marked the order paid before the cancel redirect.
 */
type PayHereCancelPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PayHereCancelPage({
  searchParams,
}: PayHereCancelPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/checkout/payhere/cancel");
  }

  const { orderId } = await searchParams;
  if (!orderId?.trim()) notFound();

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "payhere") notFound();

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "payhere") notFound();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Payment cancelled
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span>.
        Your PayHere payment was cancelled or not completed. If you already paid,
        we will confirm once our system receives the payment notification.
      </p>

      <PayHerePaymentStatus
        orderId={order.$id}
        initialOrderStatus={order.status}
        initialPaymentStatus={payment.status}
        variant="cancel"
      />
    </main>
  );
}
