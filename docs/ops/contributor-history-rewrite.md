# Contributor history rewrite (Nov 2026)

`main` was rewritten once to remap a single commit from `Cursor Agent <cursoragent@cursor.com>` to **Senuka Deneth** via [`.mailmap`](../../.mailmap). **File contents are unchanged**; commit SHAs on `main` from that point forward are new.

## Everyone with an existing clone

```bash
git fetch origin
git checkout main
git reset --hard origin/main
```

New `main` tip after push: `205c9190af211d0ef0e9f9e0970fbd0203f7d9f9` (replaces pre-rewrite `9b1cc27269c52deecdc133168c9000bdaf107579`).

## Open pull requests

Rebase onto the new `main` (expect conflicts only where you touched the same lines as concurrent work):

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

## Rollback (admins only)

If the rewrite must be undone, force-push the saved pre-rewrite tip (see [`pre-rewrite-main-sha.txt`](./pre-rewrite-main-sha.txt)). This brings **Cursor Agent** back into contributor history.

## Verify locally

```bash
git log main --author='cursoragent'   # should print nothing
./scripts/verify-commit-authors.sh    # optional guard for new work
```

GitHub **Contributors** may take a few hours to refresh after the force-push.
