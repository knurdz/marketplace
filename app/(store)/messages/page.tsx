import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { listBuyerThreads } from "@/lib/services/threads";

export default async function BuyerMessagesPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/messages");

  const { threads, error } = await listBuyerThreads();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Messages"
        description="Order conversations with sellers. Bank slip verification stays with admin."
      />

      {error ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {threads.length === 0 && !error ? (
        <EmptyState
          className="mt-10"
          title="No conversations yet"
          description="Open a thread from a paid or in-progress order."
          action={
            <Button variant="secondary" asChild>
              <Link href="/orders">Your orders</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
          {threads.map((thread) => (
            <li key={thread.$id}>
              <Link
                href={`/messages/${thread.$id}`}
                className="block px-4 py-4 text-sm hover:bg-card-hover"
              >
                Order {thread.orderId}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
