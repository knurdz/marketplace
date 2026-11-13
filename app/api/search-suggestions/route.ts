import { NextResponse } from "next/server";
import { getSearchSuggestionIndex } from "@/lib/services/products";
import {
  assertRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

/** Cache the public suggestion index ~5 minutes (CDN / ISR when configured). */
export const revalidate = 300;

export async function GET() {
  const ip = await getClientIp();
  const rate = await assertRateLimit({
    bucket: "public.searchSuggestions",
    key: `ip:${ip}`,
    ...RATE_LIMITS.publicReads,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }
  const index = await getSearchSuggestionIndex();
  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
