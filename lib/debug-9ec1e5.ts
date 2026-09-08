import { appendFileSync } from "node:fs";

const LOG_PATH =
  "/Users/senukadeneth/Library/Mobile Documents/com~apple~CloudDocs/Documents/Projects/marketplace/.cursor/debug-9ec1e5.log";
const ENDPOINT =
  "http://127.0.0.1:7905/ingest/ff251996-a39c-4324-9ff7-fe99cae5873e";

export async function debugLog9ec1e5(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  runId?: string;
}): Promise<void> {
  const body = {
    sessionId: "9ec1e5",
    runId: payload.runId ?? "repro",
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
  await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9ec1e5",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => {});
}
