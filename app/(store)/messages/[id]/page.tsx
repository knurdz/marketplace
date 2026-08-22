import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageThreadPanel } from "@/components/messaging/message-thread-panel";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  getParticipantThread,
  listThreadMessages,
} from "@/lib/services/threads";

type ThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerThreadPage({ params }: ThreadPageProps) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/messages");

  const { id } = await params;
  const thread = await getParticipantThread(id);
  if (!thread || thread.buyerId !== user.$id) notFound();

  const { messages, error } = await listThreadMessages(thread.$id);

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Conversation</h1>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        Order {thread.orderId}
      </p>

      {error ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-10">
        <MessageThreadPanel
          threadId={thread.$id}
          messages={messages}
          currentUserId={user.$id}
          portal="buyer"
        />
      </div>

      <p className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/messages">Inbox</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${thread.orderId}`}>View order</Link>
        </Button>
      </p>
    </main>
  );
}
