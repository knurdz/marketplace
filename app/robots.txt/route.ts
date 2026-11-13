import { NextResponse } from "next/server";
import { buildRobotsTxt } from "@/lib/seo/robots-txt";

export async function GET(): Promise<NextResponse> {
  const body = buildRobotsTxt();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
