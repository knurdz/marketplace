import nodemailer from "nodemailer";

const EMAIL_ADDRESS = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;

function withoutHeaderBreaks(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function maskEmailAddress(email: string): string {
  const normalized = email.trim();
  const at = normalized.indexOf("@");
  if (at <= 0) return "[invalid-email]";
  return `${normalized[0]}***${normalized.slice(at)}`;
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
};

function readSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const portRaw = process.env.SMTP_PORT?.trim() ?? "465";
  const user = process.env.SMTP_USER?.trim() ?? "";
  const password = process.env.SMTP_PASSWORD?.trim() ?? "";
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !password || !from) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.",
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a positive number.");
  }
  if (/[\r\n]/.test(from)) {
    throw new Error("SMTP_FROM contains invalid header characters.");
  }

  return {
    host,
    port,
    user,
    password,
    from,
    secure: port === 465,
  };
}

export async function sendSmtpMail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const to = withoutHeaderBreaks(params.to).toLowerCase();
  if (!EMAIL_ADDRESS.test(to) || to !== params.to.trim().toLowerCase()) {
    throw new Error("Invalid email recipient.");
  }
  const subject = withoutHeaderBreaks(params.subject).slice(0, 200);
  if (!subject) throw new Error("Email subject is required.");

  const config = readSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text: params.text,
    ...(params.html ? { html: params.html } : {}),
  });
}
