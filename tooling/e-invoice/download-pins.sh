#!/usr/bin/env bash
# Download pinned Mustang-CLI + KoSIT jars/config into tooling/e-invoice/.cache
# Pins: versions.lock.json (D-08). CI caches this directory.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOCK="$ROOT/tooling/e-invoice/versions.lock.json"
CACHE="$ROOT/tooling/e-invoice/.cache"
mkdir -p "$CACHE"

MUSTANG_VER=$(node -e "console.log(require('$LOCK').mustangCli)")
KOSIT_VER=$(node -e "console.log(require('$LOCK').kositValidator)")
KOSIT_CFG=$(node -e "console.log(require('$LOCK').kositConfig)")

MUSTANG_JAR="Mustang-CLI-${MUSTANG_VER}.jar"
KOSIT_JAR="validator-${KOSIT_VER}-standalone.jar"
KOSIT_ZIP="xrechnung-3.0.2-validator-configuration-${KOSIT_CFG}.zip"

MUSTANG_URL="https://github.com/ZUGFeRD/mustangproject/releases/download/core-${MUSTANG_VER}/${MUSTANG_JAR}"
KOSIT_JAR_URL="https://github.com/itplr-kosit/validator/releases/download/v${KOSIT_VER}/${KOSIT_JAR}"
KOSIT_CFG_URL="https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/download/v${KOSIT_CFG}/${KOSIT_ZIP}"

download() {
  local url="$1" dest="$2"
  if [[ -f "$dest" ]]; then
    echo "cached: $(basename "$dest")"
    return 0
  fi
  echo "download: $(basename "$dest")"
  curl -fsSL -o "${dest}.partial" "$url"
  mv "${dest}.partial" "$dest"
}

download "$MUSTANG_URL" "$CACHE/$MUSTANG_JAR"
download "$KOSIT_JAR_URL" "$CACHE/$KOSIT_JAR"
download "$KOSIT_CFG_URL" "$CACHE/$KOSIT_ZIP"

CFG_DIR="$CACHE/kosit-config-${KOSIT_CFG}"
if [[ ! -f "$CFG_DIR/scenarios.xml" ]]; then
  rm -rf "$CFG_DIR"
  mkdir -p "$CFG_DIR"
  unzip -q "$CACHE/$KOSIT_ZIP" -d "$CFG_DIR"
fi

# Write path hints for validate.sh / CI
cat > "$CACHE/paths.env" <<EOF
MUSTANG_JAR=$CACHE/$MUSTANG_JAR
KOSIT_JAR=$CACHE/$KOSIT_JAR
KOSIT_SCENARIOS=$CFG_DIR/scenarios.xml
KOSIT_REPO=$CFG_DIR
EOF

echo "pins ready under $CACHE"
