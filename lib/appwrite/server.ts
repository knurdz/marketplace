"use server";

import { DrizzleTablesDB } from "@/lib/db/tables-db";
import { UsersApi } from "@/lib/db/users";
import { DiskStorage } from "@/lib/storage/disk-storage-api";

const tables = new DrizzleTablesDB();
const users = new UsersApi();
const storage = new DiskStorage();

/**
 * Former admin client: full data access (server-only).
 */
export async function createAdminClient() {
  return {
    tables,
    storage,
    users,
    get account() {
      throw new Error("Use Better Auth APIs instead of account (admin).");
    },
    get functions() {
      throw new Error("PayHere runs in Next.js routes, not Appwrite Functions.");
    },
  };
}

/**
 * Session-scoped client: authorization enforced in services via getLoggedInUser().
 */
export async function createSessionClient() {
  return {
    tables,
    storage,
    get account() {
      throw new Error("Use getLoggedInUser() / Better Auth session.");
    },
    get functions() {
      throw new Error("PayHere runs in Next.js routes, not Appwrite Functions.");
    },
  };
}

/** Guest/public reads (no session required). */
export async function createPublicClient() {
  return {
    tables,
    get account() {
      throw new Error("Use Better Auth public APIs.");
    },
  };
}
