import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let pool: mysql.Pool | null = null;
let dbInstance: MySql2Database<typeof schema> | null = null;

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

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      uri: getDatabaseUrl(),
      connectionLimit: 10,
      waitForConnections: true,
    });
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
