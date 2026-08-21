import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageThreadPanel } from "@/components/messaging/message-thread-panel";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  getParticipantThread,
  listThreadMessages,
} from "@/lib/services/threads";

type SellerThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerThreadPage({ params }: SellerThreadPageProps) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?next=/seller/messages");

  const { id } = await params;
  const thread = await getParticipantThread(id);
  if (!thread || thread.sellerId !== user.$id) notFound();

  const messages = await listThreadMessages(thread.$id);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm text-accent">$ ./seller --messages</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Conversation</h2>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        Order {thread.orderId}
      </p>

      <div className="mt-10">
        <MessageThreadPanel
          threadId={thread.$id}
          messages={messages}
          currentUserId={user.$id}
          portal="seller"
        />
      </div>

      <p className="mt-12 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/messages">Inbox</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/seller/orders/${thread.orderId}`}>View order</Link>
        </Button>
      </p>
    </div>
  );
}
