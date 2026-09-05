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
export SHA_TAG="sha-deadbeef"
export IMAGE="ghcr.io/org/clared"
export API_HEALTH_URL="https://mock-api.example/health/ready"
export GITHUB_STEP_SUMMARY="$SUMMARY_FILE"
export MOCK_PIN_LOG="$PIN_LOG"
export MOCK_SCENARIO=""

# Fail closed: deploy script must stay API-only (D-09).
if grep -Fq 'WORKER_UUID' "$SCRIPT" \
  || grep -Fq 'COOLIFY_APP_WORKER' "$SCRIPT" \
  || grep -Fq -- '-worker' "$SCRIPT"; then
  echo "FAIL: coolify-deploy-nest.sh still references worker pin/tag" >&2
  exit 1
fi

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
    if [ "${MOCK_HEALTH_CODE:-200}" = "200" ]; then
      printf '%s\n%s' \
        "{\"status\":\"ok\",\"info\":{\"build\":{\"status\":\"up\",\"sha\":\"${SHA_TAG}\"}},\"details\":{\"build\":{\"status\":\"up\",\"sha\":\"${SHA_TAG}\"}}}" \
        "200"
    else
      printf '%s\n%s' '{"status":"error"}' "${MOCK_HEALTH_CODE:-503}"
    fi
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
  if [ "$scenario" = "term_after_api_pin" ]; then
    count="$(cat "${MOCK_DEPLOY_POST_COUNT_FILE:-/dev/null}" 2>/dev/null || echo 0)"
    echo $((count + 1)) > "${MOCK_DEPLOY_POST_COUNT_FILE:-/dev/null}"
    if [ "$count" -eq 0 ]; then
      # Hang until the test SIGTERMs the deploy script. Bypass PATH sleep stub.
      exec /bin/sleep 30
    fi
    printf '%s\n' '{"deployments":[{"deployment_uuid":"api-rollback"}]}'
    exit 0
  fi
  printf '%s\n' '{"deployments":[{"deployment_uuid":"api-forward"}]}'
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/deployments/"* ]]; then
  printf '%s\n' '{"status":"finished"}'
  exit 0
fi

if [[ "$joined" == *"GET"* && "$joined" == *"/applications/"* ]]; then
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
  export MOCK_API_GET_COUNT_FILE="${STUB_DIR}/api_get_count"
  set +e
  bash "$SCRIPT" >"$OUTPUT_FILE" 2>&1
  local rc=$?
  set -e
  return "$rc"
}

grep_pin() {
  grep -F "$1" "$PIN_LOG" || true
}

echo "test: health poll failure rolls back API"
export MOCK_SCENARIO="health_fail"
export MOCK_HEALTH_CODE="503"
if run_deploy; then
  echo "FAIL: expected non-zero exit on health poll failure" >&2
  exit 1
fi
if ! grep_pin "pin:${API_UUID}:prev-api" | grep -q .; then
  echo "FAIL: expected API rollback pin after health failure" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
assert_no_token_leak "health_fail"

echo "test: SIGTERM after API pin rolls back via EXIT trap"
export MOCK_SCENARIO="term_after_api_pin"
export MOCK_HEALTH_CODE="200"
: > "$PIN_LOG"
: > "$OUTPUT_FILE"
: > "$SUMMARY_FILE"
echo 0 > "${STUB_DIR}/api_get_count"
echo 0 > "${STUB_DIR}/deploy_post_count"
export MOCK_API_GET_COUNT_FILE="${STUB_DIR}/api_get_count"
export MOCK_DEPLOY_POST_COUNT_FILE="${STUB_DIR}/deploy_post_count"
set -m
bash "$SCRIPT" >"$OUTPUT_FILE" 2>&1 &
deploy_pid=$!
set +m
pin_seen=0
for _ in $(seq 1 50); do
  if grep -Fq "pin:${API_UUID}:${SHA_TAG}" "$PIN_LOG" 2>/dev/null; then
    pin_seen=1
    break
  fi
  /bin/sleep 0.1
done
if [ "$pin_seen" != "1" ]; then
  kill -TERM -"$deploy_pid" 2>/dev/null || kill -TERM "$deploy_pid" 2>/dev/null || true
  echo "FAIL: API pin never appeared before TERM" >&2
  cat "$PIN_LOG" >&2
  cat "$OUTPUT_FILE" >&2
  exit 1
fi
# Process-group TERM hits the deploy shell and the hung curl child so the
# EXIT trap runs even on bash 3.2 (which defers traps until children exit).
kill -TERM -"$deploy_pid" 2>/dev/null || kill -TERM "$deploy_pid" 2>/dev/null || true
term_wait_end=$((SECONDS + 2))
while kill -0 "$deploy_pid" 2>/dev/null && [ "$SECONDS" -lt "$term_wait_end" ]; do
  /bin/sleep 0.05
done
if kill -0 "$deploy_pid" 2>/dev/null; then
  kill -KILL -"$deploy_pid" 2>/dev/null || kill -KILL "$deploy_pid" 2>/dev/null || true
  wait "$deploy_pid" 2>/dev/null || true
  echo "FAIL: deploy script still running 2s after SIGTERM" >&2
  cat "$OUTPUT_FILE" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
set +e
wait "$deploy_pid"
term_rc=$?
set -e
if [ "$term_rc" -eq 0 ]; then
  echo "FAIL: expected non-zero exit after SIGTERM" >&2
  cat "$OUTPUT_FILE" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
if ! grep_pin "pin:${API_UUID}:prev-api" | grep -q .; then
  echo "FAIL: expected API rollback pin after SIGTERM" >&2
  cat "$PIN_LOG" >&2
  cat "$OUTPUT_FILE" >&2
  exit 1
fi
assert_no_token_leak "term_after_api_pin"

echo "test: happy path deploy completes without token leak"
export MOCK_SCENARIO="success"
export MOCK_HEALTH_CODE="200"

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
if ! grep -Fq -x "pin:${API_UUID}:${SHA_TAG}" "$PIN_LOG"; then
  echo "FAIL: success path missing API forward pin" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
if grep -E 'pin:.*-worker|WORKER|worker-uuid' "$PIN_LOG" | grep -q .; then
  echo "FAIL: worker pin must not appear on API-only deploy" >&2
  cat "$PIN_LOG" >&2
  exit 1
fi
assert_no_token_leak "success"

ACTIONLINT_IMAGE="rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
docker run --rm --entrypoint shellcheck -v "${REPO_ROOT}:/repo" -w /repo "$ACTIONLINT_IMAGE" \
  .github/scripts/coolify-deploy-nest.sh .github/scripts/coolify-deploy-nest.test.sh
docker run --rm -v "${REPO_ROOT}:/repo" -w /repo "$ACTIONLINT_IMAGE"
uvx zizmor@1.30.0 "${REPO_ROOT}/.github/workflows/backend-image.yml"

echo "OK: coolify-deploy-nest mock tests passed"
