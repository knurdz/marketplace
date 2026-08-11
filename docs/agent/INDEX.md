# Agent reference docs

All documents coding agents should read for Knurdz Marketplace live here (except the living checklist kept at repo root).

## Read order (every agent session)

1. **This folder index** — `docs/agent/INDEX.md` (you are here)
2. **Work distribution + checklists + step plans** — [`../../WORK_DISTRIBUTION.md`](../../WORK_DISTRIBUTION.md) _(stays at repo root)_
3. **Member implementation guide** — [`MEMBER_IMPLEMENTATION_GUIDE.md`](./MEMBER_IMPLEMENTATION_GUIDE.md)
4. **Cursor rules** — [`.cursor/rules/`](../../.cursor/rules/) (quality, security, graphify, MCP, human-git, stack conventions)
5. **README** — [`../../README.md`](../../README.md)
6. **Schema** — [`SCHEMA.md`](./SCHEMA.md) _(created by Member 1 in step 1.7)_
7. **PayHere contract** — [`PAYHERE.md`](./PAYHERE.md) _(created by Member 4 with Member 2)_

## By member

| Member | Focus           | Guide section                 | Distribution section |
| ------ | --------------- | ----------------------------- | -------------------- |
| 1      | Foundation      | Guide §5 · Steps **1.1–1.13** | Member 1             |
| 2      | Buyer           | Guide §6 · Steps **2.1–2.16** | Member 2             |
| 3      | Seller          | Guide §7 · Steps **3.1–3.15** | Member 3             |
| 4      | Admin / PayHere | Guide §8 · Steps **4.1–4.18** | Member 4             |

## Non-negotiables

- Quality & security before speed
- One numbered step at a time
- Humans own commits, PRs, merges
- No GitHub MCP; approved MCPs only (see `.cursor/rules/mcp-acceleration.mdc`)
- Tick `WORK_DISTRIBUTION.md` after each step

## Phase 0 status

**Complete (Member 1 steps 1.1–1.13).** Teammates can auth, open role shells, upload (avatars / helpers), and read seeded `active` products via `@/lib/services`. Members 2–4 are unblocked for live Appwrite binding.
