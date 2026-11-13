import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

// React dev tooling needs eval(); production never does, so keep it out of the prod CSP.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://challenges.cloudflare.com",
  ...(isDev ? ["'unsafe-eval'"] : []),
].join(" ");

const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  "https://images.unsplash.com",
  "https://*.googleusercontent.com",
  "https://avatars.githubusercontent.com",
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
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src ${imgSrc}`,
      "font-src 'self'",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
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
  experimental: {
    // Hostinger build servers block Turbopack PostCSS child-process IPC; worker
    // threads avoid loopback sockets. Production builds use webpack (see package.json).
    turbopackPluginRuntimeStrategy: "workerThreads",
    // The build host reports dozens of CPUs but a low thread limit. Next otherwise
    // spawns one worker per CPU ("Collecting page data using 62 workers") and
    // aborts with EAGAIN (os error 11).
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    serverActions: {
      bodySizeLimit: "6mb",
    },
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
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
