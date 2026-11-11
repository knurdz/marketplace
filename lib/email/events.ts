import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { createNotificationForUser } from "@/lib/backend/notifications";
import { getActiveUserById } from "@/lib/backend/session";
import { getAppUrl } from "@/lib/config/app";
import { getDb } from "@/lib/db/client";
import { authUser } from "@/lib/db/schema";
import { sendSmtpMail } from "@/lib/email/smtp";
import { renderMarketplaceEmail } from "@/lib/email/template";
import { logError } from "@/lib/observability/log-error";
import {
  assertRateLimit,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

export type EventNotifyParams = {
  type: string;
  title: string;
  body: string;
  /** Same-origin relative path; converted to an absolute URL in the email. */
  link?: string | null;
  /** Extra plain-text lines appended after the body (contacts, reasons). */
  detailLines?: string[];
};

function absoluteLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const trimmed = link.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return null;
  }
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}${trimmed}`;
}

async function sendMailSafe(params: {
  eventType: string;
  userId: string;
  to: string;
  greetingName?: string | null;
  title: string;
  body: string;
  detailLines?: string[];
  link?: string | null;
}): Promise<void> {
  try {
    const recipientKey = createHash("sha256")
      .update(params.to.trim().toLowerCase())
      .digest("hex");
    const rate = await assertRateLimit({
      bucket: "email.events",
      key: recipientKey,
      ...RATE_LIMITS.eventEmail,
    });
    if (!rate.ok) return;

    const rendered = renderMarketplaceEmail({
      greetingName: params.greetingName,
      title: params.title,
      body: params.body,
      detailLines: params.detailLines,
      ctaHref: absoluteLink(params.link),
      ctaLabel: "Open in Knurdz",
    });
    await sendSmtpMail({
      to: params.to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    logError("email.event.send", error, {
      type: params.eventType,
      userId: params.userId,
    });
  }
}

/**
 * In-app bell + SMTP for one user. Failures are logged; never throws to callers.
 * Skips disabled / missing users.
 */
export async function notifyUserEvent(
  userId: string,
  params: EventNotifyParams,
): Promise<void> {
  const trimmedId = userId?.trim();
  if (!trimmedId) return;

  const type = params.type.trim().slice(0, 64);
  const title = params.title.trim().slice(0, 200);
  const body = params.body.trim().slice(0, 2000);
  if (!type || !title || !body) return;

  try {
    const user = await getActiveUserById(trimmedId);
    if (!user?.email) return;

    try {
      await createNotificationForUser({
        userId: trimmedId,
        type,
        title,
        body,
        link: params.link ?? null,
      });
    } catch (error) {
      logError("email.event.in_app", error, {
        type,
        userId: trimmedId,
      });
    }

    await sendMailSafe({
      eventType: type,
      userId: trimmedId,
      to: user.email,
      greetingName: user.name,
      title,
      body,
      detailLines: params.detailLines,
      link: params.link,
    });
  } catch (error) {
    logError("email.event.user", error, { type, userId: trimmedId });
  }
}

async function listActiveAdminUsers(): Promise<
  Array<{ id: string; email: string; name: string }>
> {
  const db = getDb();
  const rows = await db
    .select({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
    })
    .from(authUser)
    .where(and(eq(authUser.role, "admin"), eq(authUser.disabled, false)));
  return rows.filter((row) => Boolean(row.email?.trim()));
}

/**
 * Fan-out in-app + SMTP to every active admin. Failures are logged; never throws.
 */
export async function notifyAdminsEvent(
  params: EventNotifyParams,
): Promise<void> {
  const type = params.type.trim().slice(0, 64);
  const title = params.title.trim().slice(0, 200);
  const body = params.body.trim().slice(0, 2000);
  if (!type || !title || !body) return;

  let admins: Array<{ id: string; email: string; name: string }> = [];
  try {
    admins = await listActiveAdminUsers();
  } catch (error) {
    logError("email.event.list_admins", error, { type });
    return;
  }

  await Promise.all(
    admins.map(async (admin) => {
      try {
        await createNotificationForUser({
          userId: admin.id,
          type,
          title,
          body,
          link: params.link ?? null,
        });
      } catch (error) {
        logError("email.event.in_app", error, {
          type,
          userId: admin.id,
        });
      }

      await sendMailSafe({
        eventType: type,
        userId: admin.id,
        to: admin.email,
        greetingName: admin.name,
        title,
        body,
        detailLines: params.detailLines,
        link: params.link,
      });
    }),
  );
}

/** Format contact lines for buyer↔seller request emails (no secrets). */
export function formatContactLines(contact: {
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  label: string;
}): string[] {
  const lines: string[] = [`${contact.label}:`];
  const name = contact.displayName?.trim();
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  if (name) lines.push(`Name: ${name}`);
  if (email) lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (!name && !email && !phone) {
    lines.push("Contact details are available in your portal.");
  }
  return lines;
}
