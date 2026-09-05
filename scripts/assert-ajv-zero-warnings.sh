#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# pnpm 11 inserts `--` before extra `run` args (`jest -- --reporters`
# then matches no tests). `exec` passes flags through.
OUTPUT="$(pnpm --filter @clared/tax-engine exec jest --reporters=default --reporters=github-actions 2>&1)"
printf '%s\n' "$OUTPUT"

# Portable grep — Ubuntu GHA runners lack ripgrep; `rg` inside `if` exits 127
# without tripping set -e and silently reports OK (REL-03 false pass).
if printf '%s\n' "$OUTPUT" | grep -F 'strict mode:' >/dev/null; then
  WARN_COUNT="$(printf '%s\n' "$OUTPUT" | grep -F -c 'strict mode:' || true)"
  echo "FAIL: found ${WARN_COUNT} AJV strict mode warning(s)" >&2
  exit 1
fi

echo "OK: zero AJV strict mode warnings"
