<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines & Rules

## Agent Documentation & Process
Before planning or implementing, read:
1. `docs/agent/INDEX.md`
2. `WORK_DISTRIBUTION.md` (repo root — checklists + numbered steps)
3. `docs/agent/MEMBER_IMPLEMENTATION_GUIDE.md` (your Member section)
4. `.cursor/rules/*`
5. `docs/agent/SCHEMA.md` and `docs/agent/PAYHERE.md` when they exist

Implement **one numbered step** at a time. Tick the matching step in `WORK_DISTRIBUTION.md` when done. Do not commit unless the human explicitly asks. When a commit is allowed, follow the Git Commit Identity rules below (invoking member as author and committer).

---

## Stack & Architecture Conventions
- **Frontend**: Next.js App Router + TypeScript.
- **Backend**: Appwrite (Auth, Database, Storage, Functions).
- **Roles**: `buyer` (default), `seller` (approved), `admin` — enforce with labels/teams **and** collection permissions.
- **Portals**: storefront `/`, seller `/seller`, admin `/admin` (adjust only if project structure already differs).
- **Payments**: PayHere sandbox, bank transfer, free (`amount = 0`) — single-seller orders for MVP.
- **Statuses**: Use shared types/enums for order and payment statuses; do not invent parallel status strings.
- **SDK & Secrets**: Client SDK for public reads/user actions; secrets and PayHere notify only in Appwrite Functions (or secure server routes).
- **Permissions**: Prefer least privilege on every new collection/bucket; document permission intent in PR/commit message when touching schema.

---

## Human-Only Git Operations
Agents must **not** create commits, open/update PRs, merge, push, rebase, or amend unless the human **explicitly** asks in that message.
- **Do**: Leave changes unstaged/uncommitted for the human to review. Summarize what changed so the human can commit easily. Suggest a commit message only if asked.
- **Do not**: Run `git commit`, `git push`, `gh pr create`, `gh pr merge`, or merge/rebase flows on your own. Do not batch "I'll just commit this" after finishing a feature. Never use GitHub MCP.

---

## Git Commit Identity
When the agent creates a git commit (because the human explicitly requested it):
- **Author & Committer**: Use the member who asked the agent to commit as both author and committer. Never hardcode one teammate and never use bot identities.
- **Resolution order**:
  1. Human named in conversation / run owner.
  2. `CO_AUTHOR='Name <email>'` in managed `commit-msg` hook.
  3. Repo-local `user.name` / `user.email`.
- Set repo-local git identity prior to committing (`commit.gpgsign false`).
- Match env variables: `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`.
- Do not use `--no-verify`.
- Commit messages must not name bot identities.
- Force-push only on feature branches with `--force-with-lease` when rewriting a commit just made; never force-push `dev` or `main`.

---

## Approved MCP Tools
Use **only** approved MCP servers:
1. **Appwrite MCP** — project ops, Auth, DB, Storage, Functions, Appwrite docs
2. **PayHere docs MCP** — checkout, hash, notify_url, SDK guides
3. **PayHere Merchant MCP** (optional) — signed checkout payloads, hash verify, payment lookup (sandbox only; never commit secrets)
4. **Context7** — up-to-date Next.js / React / library docs
5. **next-devtools-mcp** — live Next.js routes, errors, logs (when dev server runs)
6. **shadcn MCP** — browse/search/install UI components
7. **Playwright MCP** — browser E2E for buyer/seller/admin flows

**Strict MCP Prohibitions**:
- Do **not** add or use GitHub MCP (or equivalent) for commits, PRs, issues, or merges.
- Do **not** use Supabase MCP for this app's data plane (Appwrite is backend).
- MCP speed never overrides security review or `WORK_DISTRIBUTION.md` checklist ticks.

---

## Graphify Workflow
This project maintains a knowledge graph at `graphify-out/`.
- **Explore first**: Before using wide searches or raw exploration, run `graphify` (`graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"`).
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- Read `graphify-out/GRAPH_REPORT.md` for broad architecture review.
- If the graph is missing or stale before large features, run `/graphify .` (or `/graphify . --update`).
- **After implementing**: Run `graphify update .` (or `/graphify . --update`) so new files and edges are indexed. Never skip this when adding modules, routes, Functions, or schema code.

---

## Security First
After each implementation, run a security pass and fix gaps before finishing:
- **AuthZ**: Server-side Appwrite permissions / role labels — never rely on UI hiding alone.
- **Secrets**: No merchant secrets, API keys, or service keys in client code or `NEXT_PUBLIC_*`.
- **Payments**: PayHere hash + `notify_url` verification only on server/Functions; never trust `return_url` alone; keep payment updates idempotent.
- **Uploads**: Validate type and size; bank slips and digital goods stay in private buckets with least-privilege access.
- **Input**: Validate and sanitize user input; avoid unchecked strings in queries or HTML.
- **IDOR**: Confirm the caller owns the order/listing/profile they mutate.
- **Logs**: Do not log secrets, full card data, or raw bank account numbers.
- If a fast path weakens security or data integrity, reject it.

---

## Quality & Certainty
Quality and security outrank speed, token savings, and shortcuts:
- Re-read changed code end-to-end (not only diff hunks).
- Trace happy path, failure path, empty/null input, and unauthorized access.
- If anything is unclear, stop and verify via docs, schema, or safe tests; do not leave TODOs that hide uncertainty.
- Fix issues found in the same turn before marking the task done.
- Do not claim "should work" without checking types, permissions, and edge cases.
- Do not invent APIs, env vars, or collection fields.

---

## Efficient Token Use
- Read only files needed for the task; use graphify queries before wide searches.
- Prefer small, targeted diffs matching existing patterns.
- Batch related tool calls; avoid re-reading files already in context.
- Summarize outcomes concisely.
- Do not dump large unrelated files into context or rewrite working code for style churn.

---

## Work Distribution Checklists
- Identify which member lane the task belongs to (1 foundation, 2 buyer, 3 seller, 4 admin/payments) before coding.
- Respect Member 1 blockers (no portal features against missing schema/auth/guards).
- After implementing, tick every relevant checklist item in `WORK_DISTRIBUTION.md`. If an item cannot be checked, fix the gap or document why. Do not silently skip.

