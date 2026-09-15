import type { NextConfig } from "next";

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
    // Baseline CSP: allow self, Appwrite, PayHere sandbox, inline styles (needed by many UI libs).
    // Tighten further once all external origins are audited.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://sandbox.payhere.lk https://www.payhere.lk",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://sgp.cloud.appwrite.io https://*.cloud.appwrite.io",
      "font-src 'self'",
      "connect-src 'self' https://sgp.cloud.appwrite.io https://*.cloud.appwrite.io https://sandbox.payhere.lk https://www.payhere.lk",
      "frame-src https://sandbox.payhere.lk https://www.payhere.lk",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://sandbox.payhere.lk https://www.payhere.lk",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
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
    ],
  },
};

export default nextConfig;
