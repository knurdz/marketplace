# Security operations

## Hostinger reverse proxy

Application rate limits are authoritative and stored in MariaDB. On shared hosting,
rely on Hostinger’s web application firewall / rate limits where available as an
additional edge layer:

- Challenge unusually high request volume to `/login`, `/register`,
  `/forgot-password`, and `/api/auth/*`.
- Rate-limit `/api/search-suggestions` and `/api/files/*` by source IP.
- Block known automated and malicious traffic, but do not rely on firewall
  rules for authorization.

The app resolves client IP from `x-real-ip`, then the first hop of
`x-forwarded-for`. It does not trust client-supplied `x-forwarded-for` when
`x-real-ip` is absent (see `proxy.ts`).

## Content Security Policy

The production policy excludes `unsafe-eval` and allowlists Cloudflare
Turnstile. `unsafe-inline` remains for Next.js bootstrap scripts. A per-request
nonce was evaluated but is deferred because Next.js nonce extraction forces
every page to dynamic rendering, which would disable the marketplace's static
and ISR caching. Revisit nonce-based CSP if the storefront moves away from
static rendering.

## Required production secrets

- `BETTER_AUTH_SECRET`
- `FORM_GUARD_SECRET`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public site key, not a secret)
- SMTP credentials

Rotate a secret immediately if it appears in logs, browser bundles, or source
control. Production files must live under `UPLOAD_DIR` on persistent Hostinger
disk (never inside the deploy tree that gets replaced on each release).

## Dependency audit

Next.js is on the patched 16.4.x line. Transitive advisories for `esbuild` and
`minimatch` are addressed in root [`package.json`](../package.json) `overrides`:

- `esbuild@0.28.2` — unifies copies pulled in by `drizzle-kit` / `@esbuild-kit/*`
  and satisfies advisory scanners; the withdrawn GHSA-gv7w advisory applies to
  Deno install paths, not this Node app.
- Scoped `minimatch@11.0.8` under `@typescript-eslint/typescript-estree` and
  `@ts-morph/common` — upstream packages still declare `^10.x`; the override
  bumps only those trees (CVE-2026-118764). Legacy `minimatch@3` used by ESLint
  core file matching is left unchanged.

After overrides and routine bumps, `npm audit` should show no high or critical
findings for those packages. Remaining low findings, if any, may still come from
other tooling. Do not run `npm audit fix --force`; recheck advisories when
upstream parents adopt patched ranges and trim overrides where possible.
