#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="${ROOT}/coolify-deploy-nest.sh"
STUB_DIR="$(mktemp -d)"
SUMMARY_FILE="$(mktemp)"
PIN_LOG="$(mktemp)"
OUTPUT_FILE="$(mktemp)"

cleanup() {
  rm -rf "$STUB_DIR" "$SUMMARY_FILE" "$PIN_LOG" "$OUTPUT_FILE"
}
trap cleanup EXIT

export COOLIFY_URL="http://mock.coolify"
export COOLIFY_TOKEN="secret-mock-token-do-not-log"
export API_UUID="api-uuid-a"
export WORKER_UUID="worker-uuid-w"
export SHA_TAG="sha-deadbeef"
export IMAGE="ghcr.io/org/clared"
export GITHUB_STEP_SUMMARY="$SUMMARY_FILE"
export MOCK_PIN_LOG="$PIN_LOG"
export MOCK_SCENARIO=""

mkdir -p "${STUB_DIR}/bin"

cat > "${STUB_DIR}/bin/sleep" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF

cat > "${STUB_DIR}/bin/curl" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail

joined="$*"
PIN_LOG="${MOCK_PIN_LOG:-/dev/null}"
scenario="${MOCK_SCENARIO:-}"

if [[ "$joined" == *"health/ready"* ]]; then
  if [[ "$joined" == *"%{http_code}"* ]]; then
    printf '%s' "${MOCK_HEALTH_CODE:-200}"
    exit 0
  fi
fi

if [[ "$joined" == *"PATCH"* && "$joined" == *"/applications/"* ]]; then
  uuid=""
  tag=""
  if [[ "$joined" =~ /applications/([^[:space:]/\"]+) ]]; then
    uuid="${BASH_REMATCH[1]}"
  fi
  if [[ "$joined" =~ docker_registry_image_tag.?:\"([^\"]+) ]]; then
    tag="${BASH_REMATCH[1]}"
  fi
  if [ -n "$uuid" ] && [ -n "$tag" ]; then
    echo "pin:${uuid}:${tag}" >> "$PIN_LOG"
  fi
  exit 0
fi

if [[ "$joined" == *"POST"* && "$joined" == *"/deploy"* ]]; then
  if [[ "$joined" == *"${WORKER_UUID}"* ]]; then
    count="$(cat "${MOCK_WORKER_POST_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
    echo $((count + 1)) > "${MOCK_WORKER_POST_COUNT_FILE:-/dev/null}"
    if [ "$scenario" = "worker_deploy_fail" ] && [ "$count" -eq 0 ]; then
      printf '%s\n' '{"deployments":[{"deployment_uuid":"worker-forward"}]}'
    else
      printf '%s\n' '{"deployments":[{"deployment_uuid":"worker-rollback"}]}'
    fi
    exit 0
  fi
  printf '%s\n' '{"deployments":[{"deployment_uuid":"api-forward"}]}'
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/deployments/"* ]]; then
  if [[ "$joined" == *"worker-forward"* ]]; then
    printf '%s\n' '{"status":"failed"}'
    exit 0
  fi
  printf '%s\n' '{"status":"finished"}'
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/applications/"* ]]; then
  if [[ "$joined" == *"${WORKER_UUID}"* ]]; then
    printf '%s\n' \
      '{"docker_registry_image_tag":"prev-worker","status":"running:healthy","health_check_enabled":false}'
    exit 0
  fi
  if [ "$scenario" = "health_fail" ] && [[ "$joined" == *"${API_UUID}"* ]]; then
    count="$(cat "${MOCK_API_GET_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
    echo $((count + 1)) > "${MOCK_API_GET_COUNT_FILE:-/dev/null}"
    if [ "$count" -ge 1 ]; then
      printf '%s\n' "{\"docker_registry_image_tag\":\"${SHA_TAG}\"}"
    else
      printf '%s\n' '{"docker_registry_image_tag":"prev-api"}'
    fi
    exit 0
  fi
  if [[ "$joined" == *"${API_UUID}"* ]]; then
    count="$(cat "${MOCK_API_GET_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
    echo $((count + 1)) > "${MOCK_API_GET_COUNT_FILE:-/dev/null}"
    if [ "$count" -ge 1 ]; then
      printf '%s\n' "{\"docker_registry_image_tag\":\"${SHA_TAG}\"}"
    else
      printf '%s\n' '{"docker_registry_image_tag":"prev-api"}'
    fi
    exit 0
  fi
fi

echo "unexpected curl: $joined" >&2
exit 1
STUB

chmod +x "${STUB_DIR}/bin/sleep" "${STUB_DIR}/bin/curl"
export PATH="${STUB_DIR}/bin:${PATH}"

assert_no_token_leak() {
  local label="$1"
  local combined
  combined="$(cat "$OUTPUT_FILE")$(cat "$SUMMARY_FILE")"
  if printf '%s' "$combined" | grep -Fq "$COOLIFY_TOKEN"; then
    echo "FAIL [$label]: COOLIFY_TOKEN leaked to output" >&2
    exit 1
  fi
}

run_deploy() {
  : > "$PIN_LOG"
  : > "$OUTPUT_FILE"
  : > "$SUMMARY_FILE"
  echo 0 > "${STUB_DIR}/api_get_count"
  echo 0 > "${STUB_DIR}/worker_get_count"
  echo 0 > "${STUB_DIR}/worker_post_count"
  export MOCK_API_GET_COUNT_FILE="${STUB_DIR}/api_get_count"
  export MOCK_WORKER_GET_COUNT_FILE="${STUB_DIR}/worker_get_count"
  export MOCK_WORKER_POST_COUNT_FILE="${STUB_DIR}/worker_post_count"
  set +e
  bash "$SCRIPT" >"$OUTPUT_FILE" 2>&1
  local rc=$?
  set -e
  return "$rc"
}

grep_pin() {
  grep -F "$1" "$PIN_LOG" || true
}

echo "test: health poll failure rolls back API before worker pin"
export MOCK_SCENARIO="health_fail"
export MOCK_HEALTH_CODE="503"
if run_deploy; then
  echo "FAIL: expected non-zero exit on health poll failure" >&2
  exit 1
fi
if grep_pin "pin:${WORKER_UUID}:${SHA_TAG}-worker" | grep -q .; then
  echo "FAIL: worker forward pin ran before health poll passed" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
if ! grep_pin "pin:${API_UUID}:prev-api" | grep -q .; then
  echo "FAIL: expected API rollback pin after health failure" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
assert_no_token_leak "health_fail"

echo "test: worker deploy failure rolls back worker before API"
export MOCK_SCENARIO="worker_deploy_fail"
export MOCK_HEALTH_CODE="200"
if run_deploy; then
  echo "FAIL: expected non-zero exit on worker deploy failure" >&2
  exit 1
fi
worker_rb_line="$(grep -n "pin:${WORKER_UUID}:prev-worker" "$PIN_LOG" | tail -1 | cut -d: -f1 || true)"
api_rb_line="$(grep -n "pin:${API_UUID}:prev-api" "$PIN_LOG" | tail -1 | cut -d: -f1 || true)"
if [ -z "$worker_rb_line" ] || [ -z "$api_rb_line" ]; then
  echo "FAIL: missing rollback pins" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
if [ "$worker_rb_line" -ge "$api_rb_line" ]; then
  echo "FAIL: worker rollback must precede API rollback (worker@${worker_rb_line} api@${api_rb_line})" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
assert_no_token_leak "worker_deploy_fail"

echo "test: happy path deploy completes without token leak"
export MOCK_SCENARIO="success"
export MOCK_HEALTH_CODE="200"
# Re-stub curl so worker-forward deployment finishes and worker status poll passes.
cat > "${STUB_DIR}/bin/curl" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail

joined="$*"
PIN_LOG="${MOCK_PIN_LOG:-/dev/null}"
scenario="${MOCK_SCENARIO:-}"

if [[ "$joined" == *"health/ready"* ]]; then
  if [[ "$joined" == *"%{http_code}"* ]]; then
    printf '%s' "${MOCK_HEALTH_CODE:-200}"
    exit 0
  fi
fi

if [[ "$joined" == *"PATCH"* && "$joined" == *"/applications/"* ]]; then
  uuid=""
  tag=""
  if [[ "$joined" =~ /applications/([^[:space:]/\"]+) ]]; then
    uuid="${BASH_REMATCH[1]}"
  fi
  if [[ "$joined" =~ docker_registry_image_tag.?:\"([^\"]+) ]]; then
    tag="${BASH_REMATCH[1]}"
  fi
  if [ -n "$uuid" ] && [ -n "$tag" ]; then
    echo "pin:${uuid}:${tag}" >> "$PIN_LOG"
  fi
  exit 0
fi

if [[ "$joined" == *"POST"* && "$joined" == *"/deploy"* ]]; then
  if [[ "$joined" == *"${WORKER_UUID}"* ]]; then
    printf '%s\n' '{"deployments":[{"deployment_uuid":"worker-forward"}]}'
  else
    printf '%s\n' '{"deployments":[{"deployment_uuid":"api-forward"}]}'
  fi
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/deployments/"* ]]; then
  printf '%s\n' '{"status":"finished"}'
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/applications/"* ]]; then
  if [[ "$joined" == *"${WORKER_UUID}"* ]]; then
    count="$(cat "${MOCK_WORKER_GET_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
    echo $((count + 1)) > "${MOCK_WORKER_GET_COUNT_FILE:-/dev/null}"
    if [ "$count" -ge 1 ]; then
      printf '%s\n' \
        "{\"docker_registry_image_tag\":\"${SHA_TAG}-worker\",\"status\":\"running:healthy\",\"health_check_enabled\":false}"
    else
      printf '%s\n' \
        '{"docker_registry_image_tag":"prev-worker","status":"running:healthy","health_check_enabled":false}'
    fi
    exit 0
  fi
  count="$(cat "${MOCK_API_GET_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
  echo $((count + 1)) > "${MOCK_API_GET_COUNT_FILE:-/dev/null}"
  if [ "$count" -ge 1 ]; then
    printf '%s\n' "{\"docker_registry_image_tag\":\"${SHA_TAG}\"}"
  else
    printf '%s\n' '{"docker_registry_image_tag":"prev-api"}'
  fi
  exit 0
fi

echo "unexpected curl: $joined" >&2
exit 1
STUB
chmod +x "${STUB_DIR}/bin/curl"

if ! run_deploy; then
  echo "FAIL: expected success path to exit 0" >&2
  cat "$OUTPUT_FILE" >&2
  exit 1
fi
if ! grep -Fq "outcome: deployed" "$SUMMARY_FILE"; then
  echo "FAIL: deploy summary missing success outcome" >&2
  cat "$SUMMARY_FILE" >&2
  exit 1
fi
assert_no_token_leak "success"

line_count="$(wc -l < "$SCRIPT" | tr -d ' ')"
if [ "$line_count" -lt 150 ]; then
  echo "FAIL: deploy script has ${line_count} lines; need >= 150" >&2
  exit 1
fi

ACTIONLINT_IMAGE="rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
docker run --rm --entrypoint shellcheck -v "${REPO_ROOT}:/repo" -w /repo "$ACTIONLINT_IMAGE" \
  .github/scripts/coolify-deploy-nest.sh .github/scripts/coolify-deploy-nest.test.sh
docker run --rm -v "${REPO_ROOT}:/repo" -w /repo "$ACTIONLINT_IMAGE"
uvx zizmor@1.30.0 "${REPO_ROOT}/.github/workflows/backend-image.yml"

echo "OK: coolify-deploy-nest mock tests passed"
