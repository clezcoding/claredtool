#!/usr/bin/env bash
set -euo pipefail
set -o pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

OUTPUT="$(pnpm --filter @clared/tax-engine test 2>&1)"
printf '%s\n' "$OUTPUT"

if printf '%s\n' "$OUTPUT" | rg -q 'strict mode:'; then
  WARN_COUNT="$(printf '%s\n' "$OUTPUT" | rg -c 'strict mode:')"
  echo "FAIL: found ${WARN_COUNT} AJV strict mode warning(s)" >&2
  exit 1
fi

echo "OK: zero AJV strict mode warnings"
