import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

// React dev tooling needs eval(); production never does, so keep it out of the prod CSP.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
].join(" ");

const DEFAULT_STORAGE_HOST = "marketplace-storage.knurdz.org";

function storageImageOrigins(): string[] {
  const hosts = new Set<string>([`https://${DEFAULT_STORAGE_HOST}`]);
  const raw =
    process.env.NEXT_PUBLIC_STORAGE_URL?.trim() ||
    process.env.STORAGE_API_URL?.trim();
  if (raw) {
    try {
      const origin = new URL(raw.includes("://") ? raw : `https://${raw}`)
        .origin;
      hosts.add(origin);
    } catch {
      // ignore invalid env
    }
  }
  return [...hosts];
}

const storageOrigins = storageImageOrigins();
const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  "https://sgp.cloud.appwrite.io",
  "https://*.cloud.appwrite.io",
  "https://images.unsplash.com",
  "https://*.googleusercontent.com",
  "https://avatars.githubusercontent.com",
  ...storageOrigins,
].join(" ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src ${imgSrc}`,
      "font-src 'self'",
      "connect-src 'self' https://sgp.cloud.appwrite.io https://*.cloud.appwrite.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "*.cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: DEFAULT_STORAGE_HOST,
      },
      ...storageOrigins
        .map((origin) => {
          try {
            const url = new URL(origin);
            if (url.hostname === DEFAULT_STORAGE_HOST) return null;
            return {
              protocol: url.protocol.replace(":", "") as "http" | "https",
              hostname: url.hostname,
            };
          } catch {
            return null;
          }
        })
        .filter(
          (p): p is { protocol: "http" | "https"; hostname: string } =>
            p != null,
        ),
    ],
  },
};

export default nextConfig;
