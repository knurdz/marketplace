import { getAppUrl } from "@/lib/config/app";

/** Matches `public/brand/logo.png` / `BRAND_LOGO_SRC` (avoid importing the React logo module). */
const BRAND_LOGO_PATH = "/brand/logo.png";
const BRAND_GREEN = "#159c55";
const PAGE_BG = "#f4f4f5";
const CARD_BORDER = "#e4e4e7";
const TEXT_PRIMARY = "#18181b";
const TEXT_MUTED = "#71717a";
const DETAIL_BG = "#fafafa";

export type MarketplaceEmailContent = {
  /** Used as the email subject line. */
  title: string;
  body: string;
  greetingName?: string | null;
  detailLines?: string[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type RenderedMarketplaceEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appOrigin(): string {
  return getAppUrl().replace(/\/$/, "");
}

function logoUrl(): string {
  return `${appOrigin()}${BRAND_LOGO_PATH}`;
}

function nl2brEscaped(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

function buildText(params: {
  greeting: string;
  title: string;
  body: string;
  detailLines: string[];
  ctaLabel: string | null;
  ctaHref: string | null;
}): string {
  const lines: string[] = [params.greeting, "", params.title, "", params.body];
  if (params.detailLines.length > 0) {
    lines.push("");
    for (const line of params.detailLines) lines.push(line);
  }
  if (params.ctaHref) {
    lines.push("");
    lines.push(`${params.ctaLabel ?? "Open"}: ${params.ctaHref}`);
  }
  lines.push("");
  lines.push("-- Knurdz Marketplace");
  lines.push(appOrigin());
  return lines.join("\n");
}

/**
 * Minimal branded multipart body: logo header, title, body, optional details + CTA.
 * All dynamic strings are HTML-escaped. Logo is served from the public app origin.
 */
export function renderMarketplaceEmail(
  params: MarketplaceEmailContent,
): RenderedMarketplaceEmail {
  const title = params.title.trim();
  const body = params.body.trim();
  const name = params.greetingName?.trim() || null;
  const greeting = name ? `Hi ${name},` : "Hi,";
  const detailLines = (params.detailLines ?? [])
    .map((line) => line.trim())
    .filter(Boolean);
  const ctaHref = params.ctaHref?.trim() || null;
  const ctaLabel = (params.ctaLabel?.trim() || "Open in Knurdz").slice(0, 80);
  const home = appOrigin();
  const logo = logoUrl();

  const detailHtml =
    detailLines.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:${DETAIL_BG};border:1px solid ${CARD_BORDER};border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:${TEXT_PRIMARY};">
              ${detailLines.map((line) => nl2brEscaped(line)).join("<br />")}
            </td>
          </tr>
        </table>`
      : "";

  const ctaHtml = ctaHref
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="border-radius:8px;background:${BRAND_GREEN};">
            <a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:12px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;">
              ${escapeHtml(ctaLabel)}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">
        Or paste this link into your browser:<br />
        <a href="${escapeHtml(ctaHref)}" style="color:${BRAND_GREEN};word-break:break-all;">${escapeHtml(ctaHref)}</a>
      </p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${CARD_BORDER};border-radius:12px;">
          <tr>
            <td style="padding:28px 28px 8px;border-bottom:1px solid ${CARD_BORDER};">
              <a href="${escapeHtml(home)}" style="text-decoration:none;">
                <img src="${escapeHtml(logo)}" alt="Knurdz Marketplace" width="160" style="display:block;width:160px;max-width:100%;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:${TEXT_PRIMARY};">
                ${escapeHtml(greeting)}
              </p>
              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:1.3;font-weight:700;color:${TEXT_PRIMARY};">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${TEXT_PRIMARY};">
                ${nl2brEscaped(body)}
              </p>
              ${detailHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${CARD_BORDER};background:${DETAIL_BG};border-radius:0 0 12px 12px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">
                Knurdz Marketplace<br />
                <a href="${escapeHtml(home)}" style="color:${TEXT_MUTED};text-decoration:underline;">${escapeHtml(home)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: title,
    text: buildText({
      greeting,
      title,
      body,
      detailLines,
      ctaLabel: ctaHref ? ctaLabel : null,
      ctaHref,
    }),
    html,
  };
}
