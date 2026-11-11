import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/config/app";

/**
 * Known AI model training and dataset-scraping user agents.
 * Blocked from crawling or training on marketplace listings and user content.
 */
const AI_TRAINING_USER_AGENTS = [
  "GPTBot",
  "Google-Extended",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Omgili",
  "YouBot",
  "Webzio-Extended",
  "img2dataset",
] as const;

/**
 * Private, authenticated, or non-canonical paths excluded from search indexing.
 */
const DISALLOWED_PATHS = [
  "/admin/",
  "/seller/",
  "/api/",
  "/dashboard",
  "/wishlist",
  "/requests/",
  "/account",
  "/oauth/",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "/register/complete",
] as const;

export function buildRobotsTxt(): string {
  const baseUrl = getAppUrl().replace(/\/$/, "");
  const lines: string[] = [
    "# Knurdz Marketplace robots.txt",
    "# Search indexing is allowed on public storefront routes; AI model training is prohibited.",
    "",
    "User-agent: *",
    "Content-Signal: search=yes, ai-train=no",
    "Allow: /",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    "",
    "# Block AI training and dataset-scraping crawlers",
  ];

  for (const agent of AI_TRAINING_USER_AGENTS) {
    lines.push(
      `User-agent: ${agent}`,
      "Content-Signal: search=no, ai-train=no",
      "Disallow: /",
      "",
    );
  }

  lines.push(`Sitemap: ${baseUrl}/sitemap.xml`, "");
  return lines.join("\n");
}

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
