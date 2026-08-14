/**
 * Self-check for admin analytics bucket zero-fill (no Appwrite required).
 * Run: node scripts/verify-admin-analytics.mjs
 */

function toDayBucket(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMonthBucket(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function resolveRange(range) {
  const selected = range === "12m" ? "12m" : "30d";
  const now = new Date();
  if (selected === "30d") {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 30);
    return { start: start.toISOString(), end: end.toISOString(), bucket: "day" };
  }
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  return { start: start.toISOString(), end: end.toISOString(), bucket: "month" };
}

function generateBucketKeys(start, end, bucket) {
  const keys = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (bucket === "day") {
    const cur = new Date(startDate);
    while (cur < endDate) {
      const key = toDayBucket(cur.toISOString());
      if (key) keys.push(key);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return keys;
  }
  const cur = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
  );
  while (cur < endDate) {
    const key = toMonthBucket(cur.toISOString());
    if (key) keys.push(key);
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
}

const r30 = resolveRange("30d");
const keys30 = generateBucketKeys(r30.start, r30.end, "day");
assert(keys30.length === 30, `30d should yield 30 daily buckets, got ${keys30.length}`);

const r12 = resolveRange("12m");
const keys12 = generateBucketKeys(r12.start, r12.end, "month");
assert(keys12.length === 12, `12m should yield 12 monthly buckets, got ${keys12.length}`);

const emptySales = keys30.map((bucket) => ({
  bucket,
  orderCount: 0,
  revenue: 0,
  currency: "LKR",
}));
assert(
  emptySales.every((r) => r.orderCount === 0 && r.revenue === 0),
  "zero-fill sales buckets must all be zero",
);

console.log("verify-admin-analytics: OK");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
}
