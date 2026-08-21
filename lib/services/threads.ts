import { ID, Permission, Query, Role } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_MESSAGES,
  TABLE_THREADS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { createSessionClient } from "@/lib/appwrite/server";
import { getLoggedInUser } from "@/lib/appwrite/session";
import {
  assertRateLimit,
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";
import type { Message, Thread } from "@/lib/types/messaging";
import type { Order, OrderStatus } from "@/lib/types";
import { getOwnOrder } from "./orders";
import { getSellerOrder } from "./seller-orders";

const MAX_BODY_LENGTH = 2000;

const THREAD_BLOCKED_STATUSES: readonly OrderStatus[] = [
  "pending_payment",
  "cancelled",
  "refunded",
];

export type ThreadActionResult =
  | { ok: true; threadId: string }
  | { ok: false; error: string };

export type SendMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

export function asThread(row: Record<string, unknown>): Thread | null {
  const $id = asNullableString(row.$id);
  const buyerId = asNullableString(row.buyerId);
  const sellerId = asNullableString(row.sellerId);
  const orderId = asNullableString(row.orderId);
  if (!$id || !buyerId || !sellerId || !orderId) return null;

  return {
    $id,
    buyerId,
    sellerId,
    orderId,
    lastMessageAt: asNullableString(row.lastMessageAt),
  };
}

export function asMessage(row: Record<string, unknown>): Message | null {
  const $id = asNullableString(row.$id);
  const threadId = asNullableString(row.threadId);
  const senderId = asNullableString(row.senderId);
  const body = asNullableString(row.body);
  if (!$id || !threadId || !senderId || body === null) return null;
  return { $id, threadId, senderId, body };
}

function threadPermissions(buyerId: string, sellerId: string): string[] {
  return [
    Permission.read(Role.user(buyerId)),
    Permission.update(Role.user(buyerId)),
    Permission.read(Role.user(sellerId)),
    Permission.update(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.label("admin")),
  ];
}

function messagePermissions(
  buyerId: string,
  sellerId: string,
  senderId: string,
): string[] {
  return [
    Permission.read(Role.user(buyerId)),
    Permission.read(Role.user(sellerId)),
    Permission.read(Role.label("admin")),
    Permission.update(Role.user(senderId)),
    Permission.delete(Role.user(senderId)),
  ];
}

function isThreadAllowedOrderStatus(status: OrderStatus): boolean {
  return !(THREAD_BLOCKED_STATUSES as readonly string[]).includes(status);
}

function sanitizeBody(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_BODY_LENGTH);
}

async function loadThreadForParticipant(
  threadId: string,
  userId: string,
): Promise<Thread | null> {
  try {
    const { tables } = await createSessionClient();
    const row = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      rowId: threadId,
    });
    const thread = asThread(row as unknown as Record<string, unknown>);
    if (!thread) return null;
    if (thread.buyerId !== userId && thread.sellerId !== userId) return null;
    return thread;
  } catch {
    return null;
  }
}

async function findThreadByOrderId(orderId: string): Promise<Thread | null> {
  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      queries: [Query.equal("orderId", orderId), Query.limit(1)],
    });
    const row = result.rows[0] as Record<string, unknown> | undefined;
    return row ? asThread(row) : null;
  } catch {
    return null;
  }
}

/** Buyer opens or creates a thread for their order. */
export async function getOrCreateBuyerThread(
  orderId: string,
): Promise<ThreadActionResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Messaging is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) return { ok: false, error: "Sign in to message the seller." };

  const order = await getOwnOrder(orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!isThreadAllowedOrderStatus(order.status)) {
    return {
      ok: false,
      error: "Messaging is not available for this order status.",
    };
  }

  const existing = await findThreadByOrderId(order.$id);
  if (existing) {
    if (existing.buyerId !== user.$id) {
      return { ok: false, error: "Order not found." };
    }
    return { ok: true, threadId: existing.$id };
  }

  try {
    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      rowId: ID.unique(),
      data: {
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        orderId: order.$id,
        lastMessageAt: null,
      },
      permissions: threadPermissions(order.buyerId, order.sellerId),
    });
    return { ok: true, threadId: row.$id };
  } catch {
    return { ok: false, error: "Could not start conversation." };
  }
}

/** Seller opens or creates a thread for their order. */
export async function getOrCreateSellerThread(
  orderId: string,
): Promise<ThreadActionResult> {
  if (!hasAppwritePublicConfig()) {
    return { ok: false, error: "Messaging is not configured." };
  }

  const user = await getLoggedInUser();
  if (!user) return { ok: false, error: "Sign in to message the buyer." };

  const order = await getSellerOrder(orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!isThreadAllowedOrderStatus(order.status)) {
    return {
      ok: false,
      error: "Messaging is not available for this order status.",
    };
  }

  const existing = await findThreadByOrderId(order.$id);
  if (existing) {
    if (existing.sellerId !== user.$id) {
      return { ok: false, error: "Order not found." };
    }
    return { ok: true, threadId: existing.$id };
  }

  try {
    const { tables } = await createSessionClient();
    const row = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      rowId: ID.unique(),
      data: {
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        orderId: order.$id,
        lastMessageAt: null,
      },
      permissions: threadPermissions(order.buyerId, order.sellerId),
    });
    return { ok: true, threadId: row.$id };
  } catch {
    return { ok: false, error: "Could not start conversation." };
  }
}

export async function listBuyerThreads(): Promise<Thread[]> {
  const user = await getLoggedInUser();
  if (!user || !hasAppwritePublicConfig()) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      queries: [
        Query.equal("buyerId", user.$id),
        Query.orderDesc("lastMessageAt"),
        Query.limit(50),
      ],
    });

    const out: Thread[] = [];
    for (const row of result.rows) {
      const thread = asThread(row as Record<string, unknown>);
      if (thread && thread.buyerId === user.$id) out.push(thread);
    }
    return out;
  } catch {
    return [];
  }
}

export async function listSellerThreads(): Promise<Thread[]> {
  const user = await getLoggedInUser();
  if (!user || !hasAppwritePublicConfig()) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      queries: [
        Query.equal("sellerId", user.$id),
        Query.orderDesc("lastMessageAt"),
        Query.limit(50),
      ],
    });

    const out: Thread[] = [];
    for (const row of result.rows) {
      const thread = asThread(row as Record<string, unknown>);
      if (thread && thread.sellerId === user.$id) out.push(thread);
    }
    return out;
  } catch {
    return [];
  }
}

export async function getParticipantThread(
  threadId: string,
): Promise<Thread | null> {
  const user = await getLoggedInUser();
  if (!user) return null;
  return loadThreadForParticipant(threadId, user.$id);
}

export async function listThreadMessages(
  threadId: string,
): Promise<Message[]> {
  const user = await getLoggedInUser();
  if (!user) return [];

  const thread = await loadThreadForParticipant(threadId, user.$id);
  if (!thread) return [];

  try {
    const { tables } = await createSessionClient();
    const result = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_MESSAGES,
      queries: [
        Query.equal("threadId", thread.$id),
        Query.orderAsc("$createdAt"),
        Query.limit(200),
      ],
    });

    const out: Message[] = [];
    for (const row of result.rows) {
      const message = asMessage(row as Record<string, unknown>);
      if (message && message.threadId === thread.$id) out.push(message);
    }
    return out;
  } catch {
    return [];
  }
}

export async function sendThreadMessage(
  threadId: string,
  bodyRaw: string,
): Promise<SendMessageResult> {
  const user = await getLoggedInUser();
  if (!user) return { ok: false, error: "Sign in to send a message." };

  try {
    assertRateLimit({
      bucket: "messages",
      key: user.$id,
      ...RATE_LIMITS.messages,
    });
  } catch {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const body = sanitizeBody(bodyRaw);
  if (!body) return { ok: false, error: "Message cannot be empty." };

  const thread = await loadThreadForParticipant(threadId, user.$id);
  if (!thread) return { ok: false, error: "Conversation not found." };

  const now = new Date().toISOString();

  try {
    const { tables } = await createSessionClient();
    const messageRow = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_MESSAGES,
      rowId: ID.unique(),
      data: {
        threadId: thread.$id,
        senderId: user.$id,
        body,
      },
      permissions: messagePermissions(
        thread.buyerId,
        thread.sellerId,
        user.$id,
      ),
    });

    await tables.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_THREADS,
      rowId: thread.$id,
      data: { lastMessageAt: now },
    });

    return { ok: true, messageId: messageRow.$id };
  } catch {
    return { ok: false, error: "Could not send message." };
  }
}

export function isMessagingAllowedForOrder(order: Pick<Order, "status">): boolean {
  return isThreadAllowedOrderStatus(order.status);
}
