import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_ORDERS,
  TABLE_PAYMENTS,
  hasAppwritePublicConfig,
} from "@/lib/appwrite/config";
import { requireLabel } from "@/lib/appwrite/roles";
import { createAdminClient } from "@/lib/appwrite/server";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";
import {
  isOrderStatus,
  isPaymentMethod,
  isPaymentStatus,
} from "@/lib/types";
import { asOrder, asPayment } from "./orders";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export type AdminOrderView = {
  $id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  $createdAt: string;
  paymentStatus: PaymentStatus | null;
};

export type ListAllOrdersResult = {
  orders: AdminOrderView[];
  nextCursor: string | null;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}

function adminSdkAvailable(): boolean {
  return hasAppwritePublicConfig() && Boolean(process.env.APPWRITE_API_KEY?.trim());
}

function clampLimit(raw?: number): number {
  return Math.min(Math.max(raw ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

/** Map a TablesDB orders row to AdminOrderView; returns null if invalid. */
export function asAdminOrder(
  row: Record<string, unknown>,
  paymentStatus: PaymentStatus | null = null,
): AdminOrderView | null {
  const order = asOrder(row);
  if (!order) return null;

  const $createdAt = asNullableString(row.$createdAt);
  if (!$createdAt) return null;

  return {
    ...order,
    $createdAt,
    paymentStatus,
  };
}

async function fetchPaymentsByOrderIds(
  orderIds: string[],
): Promise<Map<string, PaymentStatus>> {
  const map = new Map<string, PaymentStatus>();
  if (orderIds.length === 0) return map;

  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    queries: [
      Query.equal("orderId", orderIds),
      Query.limit(Math.min(orderIds.length, MAX_PAGE_SIZE)),
    ],
  });

  for (const row of result.rows) {
    const payment = asPayment(row as unknown as Record<string, unknown>);
    if (payment) {
      map.set(payment.orderId, payment.status);
    }
  }
  return map;
}

async function listOrdersFromPayments(opts: {
  limit: number;
  cursor?: string;
  orderStatus?: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
}): Promise<ListAllOrdersResult> {
  const queries = [
    Query.equal("status", opts.paymentStatus),
    Query.orderDesc("$createdAt"),
    Query.limit(opts.limit),
  ];
  if (opts.paymentMethod) {
    queries.push(Query.equal("method", opts.paymentMethod));
  }
  if (opts.cursor) {
    queries.push(Query.cursorAfter(opts.cursor));
  }

  const { tables } = await createAdminClient();
  const paymentResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_PAYMENTS,
    queries,
  });

  if (paymentResult.rows.length === 0) {
    return { orders: [], nextCursor: null };
  }

  const paymentByOrderId = new Map<
    string,
    { paymentStatus: PaymentStatus; paymentId: string }
  >();
  for (const row of paymentResult.rows) {
    const payment = asPayment(row as unknown as Record<string, unknown>);
    if (payment) {
      paymentByOrderId.set(payment.orderId, {
        paymentStatus: payment.status,
        paymentId: payment.$id,
      });
    }
  }

  const orderIds = [...paymentByOrderId.keys()];
  if (orderIds.length === 0) {
    return { orders: [], nextCursor: null };
  }

  const orderQueries = [Query.equal("$id", orderIds), Query.limit(orderIds.length)];
  if (opts.orderStatus) {
    orderQueries.push(Query.equal("status", opts.orderStatus));
  }

  const orderResult = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDERS,
    queries: orderQueries,
  });

  const orders: AdminOrderView[] = [];
  for (const row of orderResult.rows) {
    const record = row as unknown as Record<string, unknown>;
    const $id = asNullableString(record.$id);
    const paymentInfo = $id ? paymentByOrderId.get($id) : undefined;
    const view = asAdminOrder(record, paymentInfo?.paymentStatus ?? null);
    if (view) orders.push(view);
  }

  orders.sort(
    (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
  );

  const lastPayment = paymentResult.rows.at(-1) as unknown as Record<
    string,
    unknown
  >;
  const lastPaymentId = asNullableString(lastPayment?.$id);
  const nextCursor =
    paymentResult.rows.length === opts.limit && lastPaymentId
      ? lastPaymentId
      : null;

  return { orders, nextCursor };
}

async function listOrdersDirect(opts: {
  limit: number;
  cursor?: string;
  orderStatus?: OrderStatus;
  paymentMethod?: PaymentMethod;
}): Promise<ListAllOrdersResult> {
  const queries = [
    Query.orderDesc("$createdAt"),
    Query.limit(opts.limit),
  ];
  if (opts.orderStatus) {
    queries.push(Query.equal("status", opts.orderStatus));
  }
  if (opts.paymentMethod) {
    queries.push(Query.equal("paymentMethod", opts.paymentMethod));
  }
  if (opts.cursor) {
    queries.push(Query.cursorAfter(opts.cursor));
  }

  const { tables } = await createAdminClient();
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ORDERS,
    queries,
  });

  const orderIds: string[] = [];
  const rawRows: Record<string, unknown>[] = [];
  for (const row of result.rows) {
    const record = row as unknown as Record<string, unknown>;
    const $id = asNullableString(record.$id);
    if ($id) {
      orderIds.push($id);
      rawRows.push(record);
    }
  }

  const paymentStatusByOrderId = await fetchPaymentsByOrderIds(orderIds);

  const orders: AdminOrderView[] = [];
  for (const record of rawRows) {
    const $id = asNullableString(record.$id);
    const paymentStatus = $id
      ? (paymentStatusByOrderId.get($id) ?? null)
      : null;
    const view = asAdminOrder(record, paymentStatus);
    if (view) orders.push(view);
  }

  const last = orders.at(-1);
  const nextCursor =
    orders.length === opts.limit && last ? last.$id : null;

  return { orders, nextCursor };
}

/**
 * Admin-scoped, paginated all-orders list (server-only; admin SDK + label gate).
 * Filters are applied server-side via Appwrite queries — never full-table JS filter.
 */
export async function listAllOrders(opts?: {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  limit?: number;
  cursor?: string;
}): Promise<ListAllOrdersResult> {
  await requireLabel("admin");

  if (!adminSdkAvailable()) {
    return { orders: [], nextCursor: null };
  }

  const limit = clampLimit(opts?.limit);
  const cursor = opts?.cursor?.trim() || undefined;
  const orderStatus = opts?.status;
  const paymentMethod = opts?.paymentMethod;
  const paymentStatus = opts?.paymentStatus;

  try {
    if (paymentStatus) {
      return listOrdersFromPayments({
        limit,
        cursor,
        orderStatus,
        paymentMethod,
        paymentStatus,
      });
    }

    return listOrdersDirect({
      limit,
      cursor,
      orderStatus,
      paymentMethod,
    });
  } catch {
    return { orders: [], nextCursor: null };
  }
}

/** Parse URL search param into OrderStatus when valid. */
export function parseOrderStatusFilter(raw: unknown): OrderStatus | undefined {
  return isOrderStatus(raw) ? raw : undefined;
}

/** Parse URL search param into PaymentMethod when valid. */
export function parsePaymentMethodFilter(raw: unknown): PaymentMethod | undefined {
  return isPaymentMethod(raw) ? raw : undefined;
}

/** Parse URL search param into PaymentStatus when valid. */
export function parsePaymentStatusFilter(raw: unknown): PaymentStatus | undefined {
  return isPaymentStatus(raw) ? raw : undefined;
}
