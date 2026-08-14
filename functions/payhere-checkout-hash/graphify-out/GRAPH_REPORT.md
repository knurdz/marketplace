# Graph Report - payhere-checkout-hash  (2026-08-15)

## Corpus Check
- 4 files · ~1,790 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 41 nodes · 70 edges · 6 communities (5 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0ed26e08`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- hash.js
- payload.js
- main.js
- buildPayHereCheckoutPayload
- formatPayHereAmount

## God Nodes (most connected - your core abstractions)
1. `buildPayHereCheckoutPayload()` - 11 edges
2. `handleCheckoutHash()` - 8 edges
3. `computePayHereCheckoutHash()` - 4 edges
4. `evaluateSandboxCheckoutPolicy()` - 4 edges
5. `payloadContainsSecret()` - 4 edges
6. `formatPayHereAmount()` - 3 edges
7. `checkoutActionUrl()` - 3 edges
8. `splitDisplayName()` - 3 edges
9. `shippingToPayHere()` - 3 edges
10. `itemsDescription()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `buildPayHereCheckoutPayload()` --calls--> `computePayHereCheckoutHash()`  [EXTRACTED]
  src/payload.js → src/hash.js
- `handleCheckoutHash()` --calls--> `evaluateSandboxCheckoutPolicy()`  [EXTRACTED]
  src/main.js → src/hash.js
- `buildPayHereCheckoutPayload()` --calls--> `payloadContainsSecret()`  [EXTRACTED]
  src/payload.js → src/hash.js
- `handleCheckoutHash()` --calls--> `buildPayHereCheckoutPayload()`  [EXTRACTED]
  src/main.js → src/payload.js
- `evaluatePayHereHashRequest()` --calls--> `formatPayHereAmount()`  [EXTRACTED]
  src/payload.js → src/hash.js

## Import Cycles
- None detected.

## Communities (6 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.22
Nodes (8): node-appwrite, dependencies, node-appwrite, main, name, private, type, version

### Community 1 - "hash.js"
Cohesion: 0.31
Nodes (8): computePayHereCheckoutHash(), evaluateSandboxCheckoutPolicy(), isSandboxEnv(), md5Upper(), objectHasSecretKey(), PAYHERE_CHECKOUT_LIVE_URL, PAYHERE_CHECKOUT_SANDBOX_URL, payloadContainsSecret()

### Community 2 - "payload.js"
Cohesion: 0.25
Nodes (7): ALREADY_PAID, BAD_AMOUNT, CLOSED, GENERIC, NO_ITEMS, NOT_FOUND, NOT_PAYHERE

### Community 3 - "main.js"
Cohesion: 0.52
Nodes (6): parseOrderIdFromBody(), asNumber(), fail(), handleCheckoutHash(), header(), readFunctionEnv()

### Community 4 - "buildPayHereCheckoutPayload"
Cohesion: 0.33
Nodes (6): buildCheckoutUrls(), checkoutActionUrl(), itemsDescription(), shippingToPayHere(), splitDisplayName(), buildPayHereCheckoutPayload()

## Knowledge Gaps
- **15 isolated node(s):** `name`, `version`, `private`, `type`, `main` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildPayHereCheckoutPayload()` connect `buildPayHereCheckoutPayload` to `hash.js`, `payload.js`, `main.js`, `formatPayHereAmount`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `handleCheckoutHash()` connect `main.js` to `hash.js`, `buildPayHereCheckoutPayload`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._