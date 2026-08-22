import { appendFileSync } from "node:fs";

const LOG_PATH =
  "/Users/senukadeneth/Library/Mobile Documents/com~apple~CloudDocs/Documents/Projects/knurdz-marketplace/.cursor/debug-9145e1.log";
const ENDPOINT =
  "http://127.0.0.1:7922/ingest/45b03b5c-5037-44ef-993c-de4040ea7bd5";

export function debugLog9145e1(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  runId?: string;
}): void {
  const body = {
    sessionId: "9145e1",
    runId: payload.runId ?? "post-fix",
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data,
    timestamp: Date.now(),
  };
  try {
    appendFileSync(LOG_PATH, `${JSON.stringify(body)}\n`);
  } catch {
    // ignore
  }
  fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9145e1",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => {});
}
