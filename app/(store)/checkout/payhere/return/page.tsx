import { notFound, redirect } from "next/navigation";
import { PayHerePaymentStatus } from "@/components/store/payhere-payment-status";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";

/**
 * PayHere return landing page.
 * Member 1 hash Function sets return_url to:
 *   {APP_URL}/checkout/payhere/return?orderId={orders.$id}
 * PayHere redirect query params (status_code, payment_id, md5sig, etc.) are NOT
 * trusted — success/failure comes from DB polling only.
 */
type PayHereReturnPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PayHereReturnPage({
  searchParams,
}: PayHereReturnPageProps) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/checkout/payhere/return");
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
        Payment confirmation
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span>.
        We are checking your payment status — this may take a few seconds.
      </p>

      <PayHerePaymentStatus
        orderId={order.$id}
        initialOrderStatus={order.status}
        initialPaymentStatus={payment.status}
        variant="return"
      />
    </main>
  );
}
