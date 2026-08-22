import {
  DATABASE_ID,
  TABLE_PRODUCTS,
} from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";

type StockLine = { productId: string; quantity: number };

type AdminTables = Awaited<ReturnType<typeof createAdminClient>>["tables"];

function qtyByProduct(lines: StockLine[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    if (!line.productId || qty === 0) continue;
    map.set(line.productId, (map.get(line.productId) ?? 0) + qty);
  }
  return map;
}

/** Decrement live product stock. Fails the transaction if stock would go below 0. */
export async function decrementStockForLines(
  tables: AdminTables,
  lines: StockLine[],
  transactionId: string,
): Promise<void> {
  for (const [productId, quantity] of qtyByProduct(lines)) {
    await tables.decrementRowColumn({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: productId,
      column: "stock",
      value: quantity,
      min: 0,
      transactionId,
    });
  }
}

/** Restore stock reserved at order placement (cancel / reject-and-cancel / refund). */
export async function restoreStockForLines(
  tables: AdminTables,
  lines: StockLine[],
  transactionId: string,
): Promise<void> {
  for (const [productId, quantity] of qtyByProduct(lines)) {
    await tables.incrementRowColumn({
      databaseId: DATABASE_ID,
      tableId: TABLE_PRODUCTS,
      rowId: productId,
      column: "stock",
      value: quantity,
      transactionId,
    });
  }
}
