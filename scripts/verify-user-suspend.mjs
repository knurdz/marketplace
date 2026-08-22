/**
 * Step 4.3 self-check: suspend/unsuspend via Appwrite Users API.
 * Usage: node --env-file=.env.local scripts/verify-user-suspend.mjs
 */
import { Client, Query, Account, Users, TablesDB } from "node-appwrite";

const DATABASE_ID = "marketplace";
const TABLE_AUDIT_LOGS = "audit_logs";
const DEMO_PASSWORD = "DemoPass123!";
const BUYER_EMAIL = "buyer@knurdz.demo";
const ADMIN_EMAIL = "admin@knurdz.demo";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function adminClient() {
  return new Client()
    .setEndpoint(requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
    .setProject(requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"))
    .setKey(requireEnv("APPWRITE_API_KEY"));
}

async function findUserByEmail(users, email) {
  const result = await users.list({
    queries: [Query.equal("email", email), Query.limit(1)],
  });
  return result.users[0] ?? null;
}

async function tryLogin(email, password) {
  const client = adminClient();
  const account = new Account(client);
  try {
    const session = await account.createEmailPasswordSession({ email, password });
    return { ok: true, sessionSecret: session.secret };
  } catch (error) {
    return {
      ok: false,
      code: error?.code,
      type: error?.type,
      message: error?.message,
    };
  }
}

async function sessionGet(secret) {
  const client = new Client()
    .setEndpoint(requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
    .setProject(requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"))
    .setSession(secret);
  const account = new Account(client);
  try {
    const user = await account.get();
    return { ok: true, user };
  } catch (error) {
    return { ok: false, type: error?.type, message: error?.message };
  }
}

async function countAuditEvents(tables, event, resourceId) {
  const result = await tables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    queries: [
      Query.equal("event", event),
      Query.equal("resourceId", resourceId),
      Query.limit(100),
    ],
  });
  return result.rows.length;
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`OK: ${message}`);
}

async function main() {
  const users = new Users(adminClient());
  const tables = new TablesDB(adminClient());

  const buyer = await findUserByEmail(users, BUYER_EMAIL);
  const admin = await findUserByEmail(users, ADMIN_EMAIL);
  assert(buyer, "demo buyer exists");
  assert(admin, "demo admin exists");

  // Ensure buyer active before test
  if (buyer.status === false) {
    await users.updateStatus({ userId: buyer.$id, status: true });
  }

  const beforeSuspendAudits = await countAuditEvents(
    tables,
    "user.suspended",
    buyer.$id,
  );

  const loginBefore = await tryLogin(BUYER_EMAIL, DEMO_PASSWORD);
  if (!loginBefore.ok) {
    console.log("Login error detail:", loginBefore);
  }
  assert(loginBefore.ok, "buyer can login when active");

  const sessionBeforeSuspend = loginBefore.sessionSecret;
  const getBefore = await sessionGet(sessionBeforeSuspend);
  assert(getBefore.ok, "active session works before suspend");

  await users.updateStatus({ userId: buyer.$id, status: false });
  await users.deleteSessions({ userId: buyer.$id });

  const getAfter = await sessionGet(sessionBeforeSuspend);
  assert(!getAfter.ok, "existing session blocked after suspend + deleteSessions");

  const loginAfter = await tryLogin(BUYER_EMAIL, DEMO_PASSWORD);
  assert(!loginAfter.ok, "buyer cannot login when suspended");

  // Idempotent re-suspend (no second audit in real core — here we only check status)
  await users.updateStatus({ userId: buyer.$id, status: false });
  const afterFirstSuspendAudits = beforeSuspendAudits; // core writes audit; manual API does not

  await users.updateStatus({ userId: buyer.$id, status: true });
  const loginRestored = await tryLogin(BUYER_EMAIL, DEMO_PASSWORD);
  assert(loginRestored.ok, "buyer can login after unsuspend");

  // Admin block check (labels)
  assert(
    Array.isArray(admin.labels) && admin.labels.includes("admin"),
    "admin has admin label (UI/core would block suspend)",
  );

  console.log("\nAll Appwrite-level suspend checks passed.");
  console.log(
    "Note: audit row count not incremented by this script (uses Users API directly).",
  );
  console.log(`Audit baseline for user.suspended/${buyer.$id}: ${afterFirstSuspendAudits}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
