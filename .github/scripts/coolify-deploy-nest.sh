#!/usr/bin/env bash
set -euo pipefail
test -n "$COOLIFY_TOKEN"
test -n "$COOLIFY_URL"
test -n "$API_UUID"
test -n "$WORKER_UUID"
test -n "$SHA_TAG"
test -n "$IMAGE"
{
  echo "## backend-image deploy"
  echo "- API tag: ${SHA_TAG}"
  echo "- worker tag: ${SHA_TAG}-worker"
} >> "$GITHUB_STEP_SUMMARY"

coolify_get() {
  curl -fsS -X GET "${COOLIFY_URL}/api/v1/applications/${1}" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json"
}

coolify_pin() {
  local uuid="$1" tag="$2" deploy_json
  curl -fsS -X PATCH "${COOLIFY_URL}/api/v1/applications/${uuid}" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d "{\"docker_registry_image_name\":\"${IMAGE}\",\"docker_registry_image_tag\":\"${tag}\"}" \
    -o /dev/null
  # Coolify 4.3.14: GET /api/v1/deploy is 405; POST JSON body is the working verb.
  deploy_json=$(curl -fsS -X POST "${COOLIFY_URL}/api/v1/deploy" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d "{\"uuid\":\"${uuid}\",\"force\":true}")
  printf '%s' "$deploy_json" \
    | jq -er '.deployments[0].deployment_uuid | strings | select(length > 0)'
}

wait_for_deployment() {
  local name="$1" deployment_uuid="$2" attempts="$3"
  local deployment_json status last_status="unavailable"
  for _ in $(seq 1 "$attempts"); do
    deployment_json=$(curl -fsS -X GET \
      "${COOLIFY_URL}/api/v1/deployments/${deployment_uuid}" \
      -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
      -H "Accept: application/json" || true)
    status=$(printf '%s' "${deployment_json:-}" \
      | jq -r '.status // empty' 2>/dev/null || true)
    status=$(printf '%s' "$status" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
    if [ -n "$status" ] && [ "$status" != "$last_status" ]; then
      echo "${name} deployment ${deployment_uuid}: ${status}"
      last_status="$status"
    fi
    case "$status" in
      finished)
        return 0
        ;;
      failed|cancelled|cancelled-by-user|cancelled_by_user)
        echo "${name} deployment ${deployment_uuid} ended with ${status}"
        return 1
        ;;
    esac
    sleep 5
  done
  echo "${name} deployment ${deployment_uuid} timed out (last status: ${last_status})"
  return 1
}

changed_api=0
changed_worker=0

rollback_changed() {
  echo "Rolling back already-changed apps"
  local rollback_failed=0
  if [ "$changed_worker" = "1" ]; then
    if [ -n "$PREV_WORKER" ]; then
      local worker_rollback_uuid=""
      if worker_rollback_uuid=$(coolify_pin "$WORKER_UUID" "$PREV_WORKER") \
        && wait_for_deployment "worker rollback" "$worker_rollback_uuid" 60; then
        echo "- worker rollback: succeeded (${PREV_WORKER})" >> "$GITHUB_STEP_SUMMARY"
      else
        echo "- worker rollback: FAILED (${PREV_WORKER})" >> "$GITHUB_STEP_SUMMARY"
        rollback_failed=1
      fi
    else
      echo "Rollback impossible for clared-worker (previous docker_registry_image_tag is empty)"
      echo "- worker rollback: impossible (no previous tag)" >> "$GITHUB_STEP_SUMMARY"
      rollback_failed=1
    fi
  fi
  if [ "$changed_api" = "1" ]; then
    if [ -n "$PREV_API" ]; then
      local api_rollback_uuid=""
      if api_rollback_uuid=$(coolify_pin "$API_UUID" "$PREV_API") \
        && wait_for_deployment "API rollback" "$api_rollback_uuid" 60; then
        echo "- API rollback: succeeded (${PREV_API})" >> "$GITHUB_STEP_SUMMARY"
      else
        echo "- API rollback: FAILED (${PREV_API})" >> "$GITHUB_STEP_SUMMARY"
        rollback_failed=1
      fi
    else
      echo "Rollback impossible for clared-api (previous docker_registry_image_tag is empty)"
      echo "- API rollback: impossible (no previous tag)" >> "$GITHUB_STEP_SUMMARY"
      rollback_failed=1
    fi
  fi
  echo "- outcome: rollback attempted" >> "$GITHUB_STEP_SUMMARY"
  if [ "$rollback_failed" = "1" ]; then
    exit 1
  fi
}

API_JSON=$(coolify_get "$API_UUID")
WORKER_JSON=$(coolify_get "$WORKER_UUID")
PREV_API=$(printf '%s' "$API_JSON" | jq -r '.docker_registry_image_tag // empty')
PREV_WORKER=$(printf '%s' "$WORKER_JSON" | jq -r '.docker_registry_image_tag // empty')

trap rollback_changed ERR

changed_api=1
if ! API_DEPLOYMENT_UUID=$(coolify_pin "$API_UUID" "$SHA_TAG"); then
  echo "Could not start clared-api deployment"
  rollback_changed
  exit 1
fi
echo "- API deployment: ${API_DEPLOYMENT_UUID}" >> "$GITHUB_STEP_SUMMARY"
if ! wait_for_deployment "API" "$API_DEPLOYMENT_UUID" 60; then
  rollback_changed
  exit 1
fi

# F-B5 / audit 6.2: after the exact deployment has finished, verify
# the configured tag and the public readiness endpoint.
# Live GET https://clared-api.puzzlessdev.online/health/ready was HTTP 200
# on 2026-09-04. A fail-deploy drill stays human (phasenplan 4b).
# Do not add a simulate-fail input that would roll back production.
poll_ok=0
for _ in $(seq 1 24); do
  API_POLL_JSON=$(coolify_get "$API_UUID" || true)
  LIVE_TAG=$(printf '%s' "${API_POLL_JSON:-}" | jq -r '.docker_registry_image_tag // empty' 2>/dev/null || true)
  code=$(curl -sS -o /dev/null -w "%{http_code}" \
    "https://clared-api.puzzlessdev.online/health/ready" || true)
  if [ "$LIVE_TAG" = "$SHA_TAG" ] && [ "$code" = "200" ]; then
    poll_ok=1
    break
  fi
  sleep 5
done
if [ "$poll_ok" != "1" ]; then
  echo "Health poll failed for clared-api"
  rollback_changed
  exit 1
fi

changed_worker=1
if ! WORKER_DEPLOYMENT_UUID=$(coolify_pin "$WORKER_UUID" "${SHA_TAG}-worker"); then
  echo "Could not start clared-worker deployment"
  rollback_changed
  exit 1
fi
echo "- worker deployment: ${WORKER_DEPLOYMENT_UUID}" >> "$GITHUB_STEP_SUMMARY"
if ! wait_for_deployment "worker" "$WORKER_DEPLOYMENT_UUID" 60; then
  rollback_changed
  exit 1
fi

poll_ok=0
WORKER_STATUS="unavailable"
WORKER_LIVE_TAG="unavailable"
for _ in $(seq 1 12); do
  STATUS_JSON=$(coolify_get "$WORKER_UUID" || true)
  STATUS=$(printf '%s' "${STATUS_JSON:-}" | jq -r '.status // empty' 2>/dev/null || true)
  STATUS_LC=$(printf '%s' "$STATUS" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
  LIVE_TAG=$(printf '%s' "${STATUS_JSON:-}" | jq -r '.docker_registry_image_tag // empty' 2>/dev/null || true)
  HEALTH_ENABLED=$(printf '%s' "${STATUS_JSON:-}" | jq -r '(.health_check_enabled // false) | tostring' 2>/dev/null || true)
  WORKER_STATUS="${STATUS_LC:-unavailable}"
  WORKER_LIVE_TAG="${LIVE_TAG:-unavailable}"
  if [ "$LIVE_TAG" != "${SHA_TAG}-worker" ]; then
    sleep 5
    continue
  fi
  case "$STATUS_LC" in
    running|running:healthy)
      poll_ok=1
      break
      ;;
    running:unknown)
      # A background worker has no HTTP endpoint. Coolify reports
      # `running:unknown` when health checks are intentionally off.
      if [ "$HEALTH_ENABLED" != "true" ]; then
        poll_ok=1
        break
      fi
      ;;
  esac
  sleep 5
done
if [ "$poll_ok" != "1" ]; then
  echo "Status verification failed for clared-worker (tag: ${WORKER_LIVE_TAG}, status: ${WORKER_STATUS})"
  rollback_changed
  exit 1
fi

trap - ERR
echo "- outcome: deployed" >> "$GITHUB_STEP_SUMMARY"
