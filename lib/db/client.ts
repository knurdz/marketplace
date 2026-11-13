import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { logError } from "@/lib/observability/log-error";
import * as schema from "./schema";

let pool: mysql.Pool | null = null;
let dbInstance: MySql2Database<typeof schema> | null = null;

/**
 * Hostinger shared MariaDB sets wait_timeout to 20s and then drops idle sockets.
 * The pool retries once on transient connection errors.
 */
const TRANSIENT_DB_CODES = new Set([
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "PROTOCOL_ENQUEUE_AFTER_QUIT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ER_SERVER_SHUTDOWN",
]);

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL. Copy .env.example and start MariaDB (docker compose up -d).",
    );
  }
  return url;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function isTransientDbError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const record = current as { code?: unknown; message?: unknown; cause?: unknown };
    if (typeof record.code === "string" && TRANSIENT_DB_CODES.has(record.code)) {
      return true;
    }
    if (
      typeof record.message === "string" &&
      /closed state|connection lost/i.test(record.message)
    ) {
      return true;
    }
    current = record.cause;
  }
  return false;
}

async function withTransientRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    logError("db.connection.retry", error);
    return run();
  }
}

function attachRetry(poolInstance: mysql.Pool): mysql.Pool {
  const query = poolInstance.query.bind(poolInstance);
  const execute = poolInstance.execute.bind(poolInstance);
  const getConnection = poolInstance.getConnection.bind(poolInstance);

  poolInstance.query = ((...args: unknown[]) =>
    withTransientRetry(() =>
      (query as (...inner: unknown[]) => Promise<unknown>)(...args),
    )) as mysql.Pool["query"];

  poolInstance.execute = ((...args: unknown[]) =>
    withTransientRetry(() =>
      (execute as (...inner: unknown[]) => Promise<unknown>)(...args),
    )) as mysql.Pool["execute"];

  poolInstance.getConnection = (async () => {
    const connection = await getConnection();
    try {
      await connection.ping();
      return connection;
    } catch (error) {
      connection.destroy();
      if (!isTransientDbError(error)) throw error;
      logError("db.connection.retry", error);
      return getConnection();
    }
  }) as mysql.Pool["getConnection"];

  return poolInstance;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = attachRetry(
      mysql.createPool({
        uri: getDatabaseUrl(),
        // Long-running Node on Hostinger: small pool against shared max_connections.
        connectionLimit: 5,
        maxIdle: 2,
        idleTimeout: 60_000,
        connectTimeout: 10_000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        waitForConnections: true,
      }),
    );
  }
  return pool;
}

export function getDb(): MySql2Database<typeof schema> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema, mode: "default" });
  }
  return dbInstance;
}

export function newId(): string {
  return crypto.randomUUID();
}
