# Agent reference docs

All documents coding agents should read for Knurdz Marketplace live here (except the living checklist kept at repo root).

## Read order (every agent session)

1. **This folder index** — `docs/agent/INDEX.md` (you are here)
2. **Work distribution + checklists + step plans** — [`../../WORK_DISTRIBUTION.md`](../../WORK_DISTRIBUTION.md) _(stays at repo root)_
3. **Member implementation guide** — [`MEMBER_IMPLEMENTATION_GUIDE.md`](./MEMBER_IMPLEMENTATION_GUIDE.md)
4. **Cursor rules** — [`.cursor/rules/`](../../.cursor/rules/) (quality, security, graphify, MCP, human-git, stack conventions)
5. **README** — [`../../README.md`](../../README.md)
6. **Schema** — [`SCHEMA.md`](./SCHEMA.md) _(created by Member 1 in step 1.7)_
7. **PayHere contract** — [`PAYHERE.md`](./PAYHERE.md) _(interface freeze **1.20**; Function bodies + free confirm + sandbox notes = **Member 1** steps **1.22–1.28**; checkout UX = Member 2)_

## By member

| Member | Focus                    | Guide section                 | Distribution section |
| ------ | ------------------------ | ----------------------------- | -------------------- |
| 1      | Foundation + **payments** + **Phase 6** (remaining seller/admin/E2E) | Guide §5 · Steps **1.1–1.28** then **6.1–6.22** | Member 1 · Phase 6 |
| 2      | Buyer (checkout UX)      | Guide §6 · Steps **2.1–2.16** | Member 2             |
| 3      | Seller                   | Guide §7 · Steps **3.1–3.15** | Member 3 (3.4+ claimed in Phase 6) |
| 4      | Admin / moderation       | Guide §8 · Steps **4.1–4.14** | Member 4 (leftovers in Phase 6) |

## Non-negotiables

- Quality & security before speed
- One numbered step at a time
- Humans own commits, PRs, merges
- No GitHub MCP; approved MCPs only (see `.cursor/rules/mcp-acceleration.mdc`)
- Tick `WORK_DISTRIBUTION.md` after each step

## Phase 0 status

**Complete (Member 1 steps 1.1–1.13).** Teammates can auth, open role shells, upload (avatars / helpers), and read seeded `active` products via `@/lib/services`. Members 2–4 are unblocked for live Appwrite binding.

## Payment setup status

**Complete (Member 1 steps 1.22–1.28).** Members 2 and 4 consume Member 1 APIs only: `requestPayHereCheckout`, `confirmFreeOrder`, and `/admin/payments/notify-logs`. Click-path: [`PAYHERE.md`](./PAYHERE.md) (sandbox demo + 1.28 consumer contract). Seeded SKUs: `seed_demo_product` (PayHere) and `seed_demo_free_product` (free). Sandbox **card** E2E still needs merchant env + notify domain on the hash Function in the Appwrite console (never git) — **Phase 6.17**.

## Phase 6 status

**In progress — claimed by Member 1.** Seller portal **6.1–6.11**, admin seller performance **6.12**, and admin order overrides **6.13** landed. Next: **6.14** (bank-slip idempotency re-verify), then integration **6.15–6.18**. Canonical plan: [`WORK_DISTRIBUTION.md`](../../WORK_DISTRIBUTION.md) **Phase 6**.
