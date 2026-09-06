#!/usr/bin/env bash
# Run Mustang (hybrid PDF) + KoSIT (XRechnung UBL) against committed fixtures.
# Requires Java 17+ (Temurin). Local OpenJDK 8 is insufficient for Mustang 2.26.
# Exit non-zero on any validation failure — never continue-on-error (D-27).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CACHE="$ROOT/tooling/e-invoice/.cache"
LOCK="$ROOT/tooling/e-invoice/versions.lock.json"

MUSTANG_VER=$(node -e "console.log(require('$LOCK').mustangCli)")
KOSIT_VER=$(node -e "console.log(require('$LOCK').kositValidator)")
KOSIT_CFG=$(node -e "console.log(require('$LOCK').kositConfig)")

MUSTANG_JAR="$CACHE/Mustang-CLI-${MUSTANG_VER}.jar"
KOSIT_JAR="$CACHE/validator-${KOSIT_VER}-standalone.jar"
KOSIT_REPO="$CACHE/kosit-config-${KOSIT_CFG}"
KOSIT_SCENARIOS="$KOSIT_REPO/scenarios.xml"

HYBRID_PDF="${E_INVOICE_HYBRID_PDF:-$ROOT/packages/e-invoice/fixtures/fixture-1-de-b2b.pdf}"
XR_XML="${E_INVOICE_XR_XML:-$ROOT/packages/e-invoice/fixtures/fixture-xrechnung-b2g-leitweg.xml}"

java_major() {
  java -version 2>&1 | awk -F[\".] '/version/ {print ($2=="1"?$3:$2); exit}'
}

MAJOR="$(java_major)"
if [[ -z "${MAJOR}" ]] || [[ "${MAJOR}" -lt 17 ]]; then
  echo "error: Java 17+ required (found major=${MAJOR:-unknown}). Install Temurin 17+ or use CI e-invoice-validate job." >&2
  exit 1
fi

test -f "$HYBRID_PDF" || { echo "missing hybrid PDF: $HYBRID_PDF" >&2; exit 1; }
test -f "$XR_XML" || { echo "missing XRechnung XML: $XR_XML" >&2; exit 1; }
test -f "$MUSTANG_JAR" || { echo "missing Mustang jar — run download-pins.sh" >&2; exit 1; }
test -f "$KOSIT_JAR" || { echo "missing KoSIT jar — run download-pins.sh" >&2; exit 1; }
test -f "$KOSIT_SCENARIOS" || { echo "missing scenarios.xml — run download-pins.sh" >&2; exit 1; }

echo "== Mustang validate (Comfort EN16931; --no-notices skips XRechnung notice-level) =="
java -Xmx1G -Dfile.encoding=UTF-8 -jar "$MUSTANG_JAR" \
  --no-notices --action validate --source "$HYBRID_PDF"

echo "== KoSIT validate XRechnung UBL =="
REPORT_DIR="${RUNNER_TEMP:-$CACHE}/kosit-reports"
mkdir -p "$REPORT_DIR"
java -jar "$KOSIT_JAR" \
  -s "$KOSIT_SCENARIOS" \
  -r "$KOSIT_REPO" \
  -o "$REPORT_DIR" \
  -p \
  "$XR_XML"

echo "e-invoice validate OK"
