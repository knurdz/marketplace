import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderListRow } from "@/components/store/order-list-row";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listOwnOrders } from "@/lib/services/orders";

export default async function OrdersPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login?next=/orders");
  }

  const orders = await listOwnOrders();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./orders --list</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Your orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order history for your account. Only your orders are shown here.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          You have not placed any orders yet.
        </p>
      ) : (
        <ul className="mt-10" aria-label="Order history">
          {orders.map((order) => (
            <OrderListRow key={order.$id} order={order} />
          ))}
        </ul>
      )}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </p>
    </main>
  );
}
