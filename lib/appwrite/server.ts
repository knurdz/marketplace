"use server";

import { cookies } from "next/headers";
import { Account, Client, TablesDB, Users } from "node-appwrite";
import {
  getAppwriteEndpoint,
  getAppwriteProjectId,
  SESSION_COOKIE,
} from "./config";

/**
 * Guest/public server client (endpoint + project only).
 * Use for password recovery request/complete and email verify complete.
 * Never share across requests.
 */
export async function createPublicClient() {
  const client = new Client()
    .setEndpoint(getAppwriteEndpoint())
    .setProject(getAppwriteProjectId());

  return {
    get account() {
      return new Account(client);
    },
  };
}

/**
 * Session-scoped server client (end-user cookie).
 * Always create a new Client per call — never share across requests.
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(getAppwriteEndpoint())
    .setProject(getAppwriteProjectId());

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get tables() {
      return new TablesDB(client);
    },
  };
}

/**
 * Admin server client (API key). Server-only — never import into Client Components.
 * Requires APPWRITE_API_KEY with sessions.write (+ databases/users scopes as features grow).
 */
export async function createAdminClient() {
  const apiKey = process.env.APPWRITE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing APPWRITE_API_KEY. Set it in .env.local (server-only; never NEXT_PUBLIC_*).",
    );
  }

  const client = new Client()
    .setEndpoint(getAppwriteEndpoint())
    .setProject(getAppwriteProjectId())
    .setKey(apiKey);

  return {
    get account() {
      return new Account(client);
    },
    get tables() {
      return new TablesDB(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
