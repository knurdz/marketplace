# Security operations

## Vercel edge controls

Application rate limits are authoritative and stored in MariaDB. Add Vercel
Firewall rules as an additional edge layer:

- Challenge unusually high request volume to `/login`, `/register`,
  `/forgot-password`, and `/api/auth/*`.
- Rate-limit `/api/search-suggestions` and `/api/files/*` by source IP.
- Block known automated and malicious traffic, but do not rely on firewall
  rules for authorization.

Keep Vercel's forwarding headers intact. The app trusts
`x-vercel-forwarded-for` and does not trust client-supplied
`x-forwarded-for`.

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
- `STORAGE_API_TOKEN`
- SMTP credentials

Rotate a secret immediately if it appears in logs, browser bundles, or source
control. Production file storage must use `STORAGE_API_URL`; Vercel's local
filesystem is not persistent.

## Dependency audit

Next.js is on the patched 16.4.x line. After non-breaking fixes, `npm audit`
reports no high or critical findings. Remaining moderate/low findings are in
development tooling (`drizzle-kit`) and the shadcn CLI; npm only offers
breaking-version downgrades for them. Do not run `npm audit fix --force`;
recheck those advisories during routine dependency updates.
