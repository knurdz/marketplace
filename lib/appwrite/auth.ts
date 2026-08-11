"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { AppwriteException, ID } from "node-appwrite";
import { DATABASE_ID, SESSION_COOKIE, TABLE_PROFILES } from "./config";
import { createProfileForUser } from "./profiles";
import { ROLE_LABELS } from "./roles";
import { createAdminClient, createSessionClient } from "./server";

async function rollbackSignup(userId: string) {
  try {
    const { users, tables } = await createAdminClient();
    try {
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROFILES,
        rowId: userId,
      });
    } catch {
      // Profile may not exist yet.
    }
    await users.delete({ userId });
  } catch {
    // Best-effort cleanup.
  }
}

/** Only allow same-origin relative paths (blocks open redirects). */
function safeNextPath(raw: string): string | null {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return null;
  }
  return raw;
}

export type AuthActionState = {
  error?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mapAuthError(error: unknown): string {
  if (error instanceof AppwriteException) {
    if (error.code === 409) {
      return "An account with this email already exists.";
    }
    if (error.code === 401) {
      return "Invalid email or password.";
    }
    if (error.code === 400) {
      return "Check your email and password (password must be at least 8 characters).";
    }
    return "Authentication failed. Please try again.";
  }
  if (error instanceof Error) {
    if (error.message.includes("APPWRITE_API_KEY")) {
      return "Server auth is not configured. Ask an admin to set APPWRITE_API_KEY.";
    }
    if (error.message.includes("NEXT_PUBLIC_APPWRITE")) {
      return "Appwrite is not configured. Check your environment variables.";
    }
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : String(error.cause ?? "");
    if (
      error.message.includes("fetch failed") ||
      cause.includes("Connect Timeout") ||
      cause.includes("UND_ERR_CONNECT_TIMEOUT")
    ) {
      return "Could not reach Appwrite. Check your network and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

async function setSessionCookie(secret: string, expire: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expire),
  });
}

export async function signUpWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const name = readString(formData, "name");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let createdUserId: string | null = null;

  try {
    const { account, users } = await createAdminClient();
    const user = await account.create({
      userId: ID.unique(),
      email,
      password,
      name: name || undefined,
    });
    createdUserId = user.$id;

    // updateLabels replaces the full label list — set buyer only at register.
    await users.updateLabels({
      userId: user.$id,
      labels: [ROLE_LABELS.buyer],
    });

    try {
      await createProfileForUser({
        userId: user.$id,
        email,
        name: name || undefined,
      });
    } catch (profileError) {
      await rollbackSignup(user.$id);
      createdUserId = null;
      throw profileError;
    }

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    await setSessionCookie(session.secret, session.expire);
  } catch (error) {
    unstable_rethrow(error);
    if (createdUserId) {
      await rollbackSignup(createdUserId);
    }
    return { error: mapAuthError(error) };
  }

  redirect("/account");
}

export async function signInWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const next = safeNextPath(readString(formData, "next")) ?? "/account";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    await setSessionCookie(session.secret, session.expire);
  } catch (error) {
    unstable_rethrow(error);
    return { error: mapAuthError(error) };
  }

  redirect(next);
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    unstable_rethrow(error);
    // Always clear local session cookie even if Appwrite session delete fails
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  }

  redirect("/login");
}
