import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listBuyerThreads } from "@/lib/services/threads";

export default async function BuyerMessagesPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/messages");

  const threads = await listBuyerThreads();

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./messages --inbox</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Messages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order conversations with sellers. Bank slip verification stays with
        admin — use messages for shipping questions only.
      </p>

      {threads.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No conversations yet. Open a thread from a paid or in-progress order.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {threads.map((thread) => (
            <li key={thread.$id} className="border-b border-border py-3">
              <Link
                href={`/messages/${thread.$id}`}
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
          <Link href="/orders">Your orders</Link>
        </Button>
      </p>
    </main>
  );
}
