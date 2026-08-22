import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Your orders"
        description="Only your orders are shown here."
      />

      {orders.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="No orders yet"
          description="When you check out, they will land here."
          action={
            <Button asChild>
              <Link href="/market">Browse listings</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-10" aria-label="Order history">
          {orders.map((order) => (
            <OrderListRow key={order.$id} order={order} />
          ))}
        </ul>
      )}
    </main>
  );
}
