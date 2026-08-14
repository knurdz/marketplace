/**
 * Runnable checks for audit log read path (mapper + Appwrite lockdown).
 * Run: npx tsx --env-file=.env.local scripts/verify-audit-logs-read.ts
 */
import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  TABLE_AUDIT_LOGS,
  hasAppwritePublicConfig,
} from "../lib/appwrite/config";
import { createAdminClient } from "../lib/appwrite/server";
import { asAuditLogEntry } from "../lib/services/audit-logs";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// --- Mapper unit checks (no network) ---

const validRow = {
  $id: "log1",
  actorId: "user123",
  event: "seller.approved",
  resourceType: "seller_profile",
  resourceId: "sp456",
  meta: JSON.stringify({ reason: "ok" }),
  ip: "127.0.0.1",
  $createdAt: "2026-08-12T12:00:00.000Z",
};
const mapped = asAuditLogEntry(validRow);
assert(mapped !== null, "valid row maps");
assert(mapped!.event === "seller.approved", "event preserved");
assert(mapped!.meta !== null, "meta preserved");

assert(asAuditLogEntry({ ...validRow, event: "" }) === null, "empty event null");
assert(asAuditLogEntry({ ...validRow, $createdAt: "" }) === null, "empty createdAt null");

const systemRow = {
  $id: "log2",
  event: "bank_slip.approved",
  resourceType: "order",
  resourceId: "ord1",
  $createdAt: "2026-08-12T12:00:00.000Z",
};
const systemMapped = asAuditLogEntry(systemRow);
assert(systemMapped !== null && systemMapped.actorId === null, "optional actorId null");

// --- Meta display edge cases (mirrors page logic) ---
function formatMetaDisplay(meta: string | null): "json" | "raw" | "empty" {
  if (!meta) return "empty";
  try {
    JSON.parse(meta);
    return "json";
  } catch {
    return "raw";
  }
}
assert(formatMetaDisplay(null) === "empty", "null meta empty");
assert(formatMetaDisplay('{"a":1}') === "json", "json meta");
assert(formatMetaDisplay("not-json") === "raw", "raw meta");

console.log("audit-logs mapper checks passed");

// --- Appwrite lockdown (requires .env.local) ---
if (!hasAppwritePublicConfig() || !process.env.APPWRITE_API_KEY?.trim()) {
  console.log("skip Appwrite live checks (missing public config or APPWRITE_API_KEY)");
  process.exit(0);
}

async function verifyAppwriteLockdown(): Promise<void> {
  const { tables: adminTables } = await createAdminClient();
  const adminResult = await adminTables.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_AUDIT_LOGS,
    queries: [Query.orderDesc("$createdAt"), Query.limit(5)],
  });
  console.log(`admin SDK listRows: ${adminResult.rows.length} row(s)`);

  // Session client without cookie should fail or throw
  const { Client, TablesDB } = await import("node-appwrite");
  const { getAppwriteEndpoint, getAppwriteProjectId } = await import(
    "../lib/appwrite/config"
  );
  const sessionClient = new Client()
    .setEndpoint(getAppwriteEndpoint())
    .setProject(getAppwriteProjectId());
  const sessionTables = new TablesDB(sessionClient);

  let sessionBlocked = false;
  try {
    const sessionResult = await sessionTables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_AUDIT_LOGS,
      queries: [Query.limit(1)],
    });
    sessionBlocked = sessionResult.rows.length === 0;
    if (!sessionBlocked) {
      console.warn(
        "session client returned rows without auth — unexpected; check table permissions",
      );
    }
  } catch {
    sessionBlocked = true;
  }
  assert(sessionBlocked, "session client must not read audit_logs (fail or empty)");
  console.log("session client correctly blocked from audit_logs");

  if (adminResult.rows.length > 0) {
    const first = asAuditLogEntry(
      adminResult.rows[0] as unknown as Record<string, unknown>,
    );
    assert(first !== null, "live row maps via asAuditLogEntry");
    console.log(`sample event: ${first!.event} resourceType: ${first!.resourceType}`);
  } else {
    console.log("no live audit rows (empty table OK for fresh env)");
  }
}

verifyAppwriteLockdown().catch((err) => {
  console.error(err);
  process.exit(1);
});
