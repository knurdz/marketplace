import {
  and,
  asc,
  desc,
  eq,
  getTableName,
  gt,
  gte,
  inArray,
  like,
  lt,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";
import { AppwriteException, isDuplicateKeyError } from "./errors";
import type mysql from "mysql2/promise";
import { getDb, getPool, newId } from "./client";
import { parseQueries, type QueryDescriptor } from "./query";
import { TABLE_REGISTRY } from "./schema";

type AnyRow = Record<string, unknown>;

const txConnections = new Map<string, mysql.PoolConnection>();

function tableById(tableId: string): MySqlTable {
  const t = TABLE_REGISTRY[tableId as keyof typeof TABLE_REGISTRY];
  if (!t) {
    throw new Error(`Unknown table id: ${tableId}`);
  }
  return t;
}

function colRef(table: MySqlTable, attribute: string) {
  const key = attribute === "$createdAt" ? "createdAt" : attribute;
  const col = (table as unknown as Record<string, unknown>)[key];
  if (!col) {
    throw new Error(`Unknown column ${attribute} on table`);
  }
  return col as Parameters<typeof eq>[0];
}

function toAppwriteRow(row: AnyRow): AnyRow {
  const out: AnyRow = { ...row };
  if (typeof row.id === "string") {
    out.$id = row.id;
    delete out.id;
  }
  if (row.createdAt instanceof Date) {
    out.$createdAt = row.createdAt.toISOString();
    delete out.createdAt;
  }
  if (row.updatedAt instanceof Date) {
    out.$updatedAt = row.updatedAt.toISOString();
    delete out.updatedAt;
  }
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string" && /^\d+\.\d{2}$/.test(v)) {
      const n = Number(v);
      if (Number.isFinite(n)) out[k] = n;
    }
  }
  return out;
}

function fromAppwriteData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("$")) continue;
    out[k] = v;
  }
  return out;
}

function buildWhere(
  table: MySqlTable,
  descriptors: QueryDescriptor[],
): { where: SQL | undefined; orderBy: SQL[]; limit: number; cursorAfter?: string } {
  const parts: SQL[] = [];
  let orderBy: SQL[] = [];
  let limit = 25;
  let cursorAfter: string | undefined;

  for (const d of descriptors) {
    if (d.type === "equal") {
      const col = colRef(table, d.attribute);
      if (Array.isArray(d.value)) {
        parts.push(inArray(col, d.value));
      } else {
        parts.push(eq(col, d.value));
      }
    } else if (d.type === "greaterThanEqual") {
      parts.push(gte(colRef(table, d.attribute), d.value));
    } else if (d.type === "lessThan") {
      parts.push(lt(colRef(table, d.attribute), d.value));
    } else if (d.type === "lessThanEqual") {
      parts.push(lte(colRef(table, d.attribute), d.value));
    } else if (d.type === "search") {
      parts.push(
        like(colRef(table, d.attribute) as never, `%${d.value}%`),
      );
    } else if (d.type === "orderDesc") {
      orderBy = [desc(colRef(table, d.attribute))];
    } else if (d.type === "orderAsc") {
      orderBy = [asc(colRef(table, d.attribute))];
    } else if (d.type === "limit") {
      limit = d.value;
    } else if (d.type === "cursorAfter") {
      cursorAfter = d.value;
    }
  }

  if (cursorAfter) {
    parts.push(gt(colRef(table, "id"), cursorAfter));
  }

  const where = parts.length ? and(...parts) : undefined;
  return { where, orderBy, limit, cursorAfter };
}

async function getExecutor(transactionId?: string) {
  if (transactionId) {
    const conn = txConnections.get(transactionId);
    if (!conn) throw new Error("Invalid or expired transaction");
    const { drizzle } = await import("drizzle-orm/mysql2");
    const schema = await import("./schema");
    return drizzle(conn, { schema, mode: "default" });
  }
  return getDb();
}

export class DrizzleTablesDB {
  async listRows(params: {
    databaseId: string;
    tableId: string;
    queries?: string[];
    transactionId?: string;
    total?: boolean;
  }) {
    const table = tableById(params.tableId);
    const descriptors = parseQueries(params.queries);
    const { where, orderBy, limit } = buildWhere(table, descriptors);
    const db = await getExecutor(params.transactionId);

    let q = db.select().from(table).$dynamic();
    if (where) q = q.where(where);
    if (orderBy.length) q = q.orderBy(...orderBy);
    q = q.limit(limit);

    const rows = await q;
    return {
      rows: rows.map((r) => toAppwriteRow(r as AnyRow)),
      total: rows.length,
    };
  }

  async getRow(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    transactionId?: string;
  }) {
    const table = tableById(params.tableId);
    const db = await getExecutor(params.transactionId);
    const idCol = colRef(table, "id");
    const rows = await db
      .select()
      .from(table)
      .where(eq(idCol, params.rowId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      throw new AppwriteException("Row not found", 404, "row_not_found");
    }
    return toAppwriteRow(row as AnyRow);
  }

  async createRow(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    data: Record<string, unknown>;
    permissions?: string[];
    transactionId?: string;
  }) {
    const table = tableById(params.tableId);
    const db = await getExecutor(params.transactionId);
    const id =
      params.tableId === "profiles" ? params.rowId : params.rowId || newId();
    const payload = {
      ...fromAppwriteData(params.data),
      id,
    } as Record<string, unknown>;

    if (params.tableId === "profiles") {
      payload.id = params.rowId;
      payload.userId = params.data.userId ?? params.rowId;
    }

    try {
      await db.insert(table).values(payload as never);
    } catch (error) {
      throw mapWriteError(error);
    }
    return this.getRow({
      databaseId: params.databaseId,
      tableId: params.tableId,
      rowId: String(id),
      transactionId: params.transactionId,
    });
  }

  async updateRow(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    data: Record<string, unknown>;
    transactionId?: string;
  }) {
    const table = tableById(params.tableId);
    const db = await getExecutor(params.transactionId);
    const idCol = colRef(table, "id");
    try {
      await db
        .update(table)
        .set(fromAppwriteData(params.data) as never)
        .where(eq(idCol, params.rowId));
    } catch (error) {
      throw mapWriteError(error);
    }
    return this.getRow({
      databaseId: params.databaseId,
      tableId: params.tableId,
      rowId: params.rowId,
      transactionId: params.transactionId,
    });
  }

  /** Updates only while `column` is one of `values`; returns false when no row matched. */
  async updateRowIfColumnIn(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    column: string;
    values: string[];
    data: Record<string, unknown>;
    transactionId?: string;
  }): Promise<boolean> {
    if (params.values.length === 0) return false;
    const table = tableById(params.tableId);
    const db = await getExecutor(params.transactionId);
    try {
      const result = await db
        .update(table)
        .set(fromAppwriteData(params.data) as never)
        .where(
          and(
            eq(colRef(table, "id"), params.rowId),
            inArray(colRef(table, params.column), params.values),
          ),
        );
      return affectedRows(result) > 0;
    } catch (error) {
      throw mapWriteError(error);
    }
  }

  async deleteRow(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    transactionId?: string;
  }) {
    const table = tableById(params.tableId);
    const db = await getExecutor(params.transactionId);
    const idCol = colRef(table, "id");
    await db.delete(table).where(eq(idCol, params.rowId));
  }

  async createTransaction(_params: { ttl?: number }) {
    const pool = getPool();
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    const transactionId = newId();
    txConnections.set(transactionId, conn);
    return { $id: transactionId };
  }

  async updateTransaction(params: {
    transactionId: string;
    commit?: boolean;
    rollback?: boolean;
  }) {
    const conn = txConnections.get(params.transactionId);
    if (!conn) return;
    try {
      if (params.commit) {
        await conn.commit();
      } else if (params.rollback) {
        await conn.rollback();
      }
    } finally {
      conn.release();
      txConnections.delete(params.transactionId);
    }
  }

  async deleteTransaction(params: { transactionId: string }) {
    await this.updateTransaction({
      transactionId: params.transactionId,
      rollback: true,
    });
  }

  async incrementRowColumn(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    column: string;
    value: number;
    max?: number;
    transactionId?: string;
  }) {
    const { runner, sqlTable, sqlCol } = this.rawTarget(params);
    const max = params.max;
    const [result] = await runner.execute(
      `UPDATE \`${sqlTable}\` SET \`${sqlCol}\` = \`${sqlCol}\` + ? WHERE id = ?` +
        (typeof max === "number" ? ` AND \`${sqlCol}\` + ? <= ?` : ""),
      typeof max === "number"
        ? [params.value, params.rowId, params.value, max]
        : [params.value, params.rowId],
    );
    if (affectedRows(result) === 0) {
      throw new AppwriteException(
        "Increment rejected (row missing or limit reached)",
        400,
        "column_limit",
      );
    }
  }

  async decrementRowColumn(params: {
    databaseId: string;
    tableId: string;
    rowId: string;
    column: string;
    value: number;
    min?: number;
    transactionId?: string;
  }) {
    const { runner, sqlTable, sqlCol } = this.rawTarget(params);
    const min = params.min ?? 0;
    const [result] = await runner.execute(
      `UPDATE \`${sqlTable}\` SET \`${sqlCol}\` = \`${sqlCol}\` - ? WHERE id = ? AND \`${sqlCol}\` - ? >= ?`,
      [params.value, params.rowId, params.value, min],
    );
    if (affectedRows(result) === 0) {
      throw new AppwriteException(
        "Decrement rejected (row missing or below minimum)",
        400,
        "column_limit",
      );
    }
  }

  /** Resolve real SQL table/column names from the Drizzle schema (never from caller strings). */
  private rawTarget(params: {
    tableId: string;
    column: string;
    transactionId?: string;
  }) {
    const table = tableById(params.tableId);
    const column = colRef(table, params.column) as unknown as MySqlColumn;
    const conn = params.transactionId
      ? txConnections.get(params.transactionId)
      : undefined;
    if (params.transactionId && !conn) {
      throw new Error("Invalid or expired transaction");
    }
    return {
      runner: conn ?? getPool(),
      sqlTable: getTableName(table),
      sqlCol: column.name,
    };
  }
}

function affectedRows(result: unknown): number {
  // Drizzle's mysql2 driver returns [ResultSetHeader, fields]; raw execute is destructured already.
  const header = Array.isArray(result) ? result[0] : result;
  return (header as { affectedRows?: number } | undefined)?.affectedRows ?? 0;
}

function mapWriteError(error: unknown): unknown {
  if (isDuplicateKeyError(error)) {
    return new AppwriteException(
      "Row already exists",
      409,
      "row_already_exists",
    );
  }
  return error;
}

export const ID = { unique: () => newId() };
