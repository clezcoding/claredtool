#!/usr/bin/env bash
set -euo pipefail
test -n "$COOLIFY_TOKEN"
test -n "$COOLIFY_URL"
test -n "$API_UUID"
test -n "$SHA_TAG"
test -n "$IMAGE"
test -n "$API_HEALTH_URL"
{
  echo "## backend-image deploy"
  echo "- API tag: ${SHA_TAG}"
} >> "$GITHUB_STEP_SUMMARY"

coolify_get() {
  curl -fsS --connect-timeout 5 --max-time 30 -X GET "${COOLIFY_URL}/api/v1/applications/${1}" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json"
}

coolify_pin() {
  local uuid="$1" tag="$2" deploy_json payload
  payload=$(jq -cn --arg image "$IMAGE" --arg tag "$tag" \
    '{docker_registry_image_name: $image, docker_registry_image_tag: $tag}')
  curl -fsS --connect-timeout 5 --max-time 30 -X PATCH "${COOLIFY_URL}/api/v1/applications/${uuid}" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    -o /dev/null
  # Coolify 4.3.14: GET /api/v1/deploy is 405; POST JSON body is the working verb.
  deploy_json=$(curl -fsS --connect-timeout 5 --max-time 30 -X POST "${COOLIFY_URL}/api/v1/deploy" \
    -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d "$(jq -cn --arg uuid "$uuid" '{uuid: $uuid, force: true}')")
  printf '%s' "$deploy_json" \
    | jq -er '.deployments[0].deployment_uuid | strings | select(length > 0)'
}

wait_for_deployment() {
  local name="$1" deployment_uuid="$2" attempts="$3"
  local deployment_json status last_status="unavailable"
  for _ in $(seq 1 "$attempts"); do
    deployment_json=$(curl -fsS --connect-timeout 5 --max-time 30 -X GET \
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
deploy_succeeded=0
rollback_started=0

rollback_changed() {
  # Idempotent: ERR + EXIT (or explicit call + EXIT) must not double-pin.
  if [ "$rollback_started" = "1" ]; then
    return 0
  fi
  rollback_started=1
  echo "Rolling back already-changed apps"
  local rollback_failed=0
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

# GHA cancel / job timeout deliver SIGTERM (EXIT), not ERR. Roll back partial
# pins on abnormal exit without undoing a completed deploy.
rollback_on_exit() {
  if [ "$deploy_succeeded" = "1" ]; then
    return 0
  fi
  if [ "$changed_api" = "1" ]; then
    rollback_changed || true
  fi
}

API_JSON=$(coolify_get "$API_UUID")
PREV_API=$(printf '%s' "$API_JSON" | jq -r '.docker_registry_image_tag // empty')

trap rollback_on_exit EXIT
trap rollback_changed ERR
# INT/TERM also hit EXIT after the shell terminates; keep explicit handlers so
# cancel/timeout paths are obvious and always re-enter rollback_on_exit.
trap 'exit 130' INT
trap 'exit 143' TERM

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

# D-25: /health/ready is postgres+redis+build only (no Chromium). Poll tag + Ready
# body build sha. A fail-deploy drill stays human (phasenplan 4b).
# Do not add a simulate-fail input that would roll back production.
poll_ok=0
consecutive_ok=0
for _ in $(seq 1 24); do
  API_POLL_JSON=$(coolify_get "$API_UUID" || true)
  LIVE_TAG=$(printf '%s' "${API_POLL_JSON:-}" | jq -r '.docker_registry_image_tag // empty' 2>/dev/null || true)
  http_response=$(curl -sS --connect-timeout 5 --max-time 15 -w "\n%{http_code}" \
    "$API_HEALTH_URL" 2>/dev/null || true)
  code=$(printf '%s' "$http_response" | tail -1)
  ready_body=$(printf '%s' "$http_response" | sed '$d')
  ready_sha=$(printf '%s' "$ready_body" | jq -r '.details.build.sha // .info.build.sha // empty' 2>/dev/null || true)
  if [ "$LIVE_TAG" = "$SHA_TAG" ] && [ "$code" = "200" ] && [ "$ready_sha" = "$SHA_TAG" ]; then
    consecutive_ok=$((consecutive_ok + 1))
    if [ "$consecutive_ok" -ge 2 ]; then
      poll_ok=1
      break
    fi
  else
    consecutive_ok=0
  fi
  sleep 5
done
if [ "$poll_ok" != "1" ]; then
  echo "Health poll failed for clared-api"
  rollback_changed
  exit 1
fi

deploy_succeeded=1
trap - ERR EXIT INT TERM
echo "- outcome: deployed" >> "$GITHUB_STEP_SUMMARY"
