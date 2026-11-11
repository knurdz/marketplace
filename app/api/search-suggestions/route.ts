import { NextResponse } from "next/server";
import { getSearchSuggestionIndex } from "@/lib/services/products";

/** Cache the public suggestion index ~5 minutes (Vercel CDN / ISR). */
export const revalidate = 300;

export async function GET() {
  const index = await getSearchSuggestionIndex();
  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
