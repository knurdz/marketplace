import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listSellerThreads } from "@/lib/services/threads";

export default async function SellerMessagesPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/seller/messages");

  const threads = await listSellerThreads();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Messages</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Buyer conversations tied to your orders. Sellers do not verify bank
        slips — admin handles payment proof review.
      </p>

      {threads.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="mt-10 space-y-3">
          {threads.map((thread) => (
            <li key={thread.$id} className="border-b border-border py-3">
              <Link
                href={`/seller/messages/${thread.$id}`}
                className="font-mono text-sm hover:text-accent"
              >
                Order {thread.orderId}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/orders">Order inbox</Link>
        </Button>
      </p>
    </div>
  );
}
