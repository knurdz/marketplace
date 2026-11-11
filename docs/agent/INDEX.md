# Agent reference docs

All documents coding agents should read for Knurdz Marketplace live here (except the living checklist kept at repo root).

## Read order (every agent session)

1. **This folder index** — `docs/agent/INDEX.md` (you are here)
2. **Work distribution + checklists + step plans** — [`../../WORK_DISTRIBUTION.md`](../../WORK_DISTRIBUTION.md) _(stays at repo root)_
3. **Member implementation guide** — [`MEMBER_IMPLEMENTATION_GUIDE.md`](./MEMBER_IMPLEMENTATION_GUIDE.md)
4. **Cursor rules** — [`.cursor/rules/`](../../.cursor/rules/) (quality, security, graphify, MCP, human-git, stack conventions)
5. **README** — [`../../README.md`](../../README.md)
6. **Schema** — [`SCHEMA.md`](./SCHEMA.md)
7. **Payments note** — [`PAYHERE.md`](./PAYHERE.md) _(platform does not process payments; contact-request flow)_

## Product model

Knurdz connects buyers and sellers. A signed-in buyer opens a product, chooses a quantity, and sends a **purchase request**. That request shows the seller’s phone and email to the buyer, and the buyer’s phone and email to the seller. They contact each other directly. The seller marks the request **sold** or **cancelled**. Stock decreases only on **sold**.

Wishlist, reviews (after sold), listing reports, and admin moderation remain. Cart, checkout, PayHere, bank slips, coupons, in-app messages, and seller earnings were removed.

## Non-negotiables

- Quality & security before speed
- One numbered step at a time when following WORK_DISTRIBUTION
- Humans own commits, PRs, merges
- No GitHub MCP; approved MCPs only (see `.cursor/rules/mcp-acceleration.mdc`)
- Tick `WORK_DISTRIBUTION.md` after each step when applicable
