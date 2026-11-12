#!/usr/bin/env bash
# Fail if commits on the current branch (vs origin/main) use disallowed bot author emails.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DISALLOWED='cursoragent@cursor.com'
UPSTREAM="${1:-origin/main}"

if ! git rev-parse --verify -q "$UPSTREAM" >/dev/null; then
  echo "verify-commit-authors: upstream $UPSTREAM not found; skip."
  exit 0
fi

BAD=$(
  git log "${UPSTREAM}"..HEAD --format='%H %ae' 2>/dev/null \
    | rg -i "$DISALLOWED" || true
)

if [[ -n "$BAD" ]]; then
  echo "verify-commit-authors: found commits with disallowed author email ($DISALLOWED):" >&2
  echo "$BAD" >&2
  echo "Use a human author per .cursor/rules/git-commit-identity.mdc" >&2
  exit 1
fi

echo "verify-commit-authors: ok"
