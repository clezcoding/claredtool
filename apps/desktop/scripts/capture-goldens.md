# Capture SOP — Phase 04.1 goldens (D-20–D-26, A1, A3, D-34)

Mac-pinned pixel gate. Product window may stay 1280×800 (`tauri.conf.json`). Capture viewport is independent.

## Host

- **OS:** macOS arm64. Record `sw_vers` (ProductVersion + BuildVersion) in every 04.1-QA.md pixel-qa row.
- **Not:** Windows/Linux CI as the release golden host (Open Q1). Local Mac is the gate.

## Viewport

1. Force **content size 1536×1024** before each shot (`manage_window` resize, logical pixels).
2. **Pin `window.devicePixelRatio`** for the session: read it once, record it, do not change scale/zoom between shots. Do not emulate a second DPR. A3 does not retarget the product default window.
3. If backing-store pixels ≠ 1536×1024, dimension check fails (A1). Do not downscale to fake a PASS.

## Capture

Prefer Tauri MCP `webview_screenshot`:

- `format: "png"`
- `windowId: "main"`
- `filePath` under `artifacts/captures/<approved-basename>.png`

If the MCP npm driver cannot load, call the **same bridge** the MCP server uses (`tauri-plugin-mcp-bridge` `capture_native_screenshot` on `ws://127.0.0.1:9223`) via `apps/desktop/scripts/capture-via-bridge.mjs`. That is still WKWebView snapshot, not OS titlebar chrome.

Do **not** OS-screencapture native chrome. Titlebar breaks D-21. Stitch PNG (`.stitch/designs/`) is **secondary dispute evidence only** (D-24).

## Theme

For each approved file:

- `*-light.png` → `applyTheme('light')` (or equivalent document paint + `localStorage clared-theme=light`)
- `*-dark.png` → `applyTheme('dark')`
- no suffix → capture the single available asset as-is after pinning light unless the file is clearly a dark artboard

Disable motion before capture:

```js
document.documentElement.style.setProperty("--dur", "0");
const s = document.createElement("style");
s.dataset.pixelCapture = "1";
s.textContent = "*,*::before,*::after{animation:none!important;transition:none!important}";
document.head.appendChild(s);
```

## Persona (R-02 / D-34)

Force **Alexander Wagner / aw@clared.de / Greenfield Studio GmbH** on every golden. Never leave a live `/me` display name in CI/goldens. If the session chip shows another identity, rewrite the visible persona nodes for the shot (capture-time only) or sign out to the R-02 fallback strings.

## Manifest (required 02–07, themes available)

Iterate **exactly** the files in `.planning/phases/04-premium-ui-brand-redesign/mockups/approved/` whose names start `02`–`07`. Include every light/dark (or single) variant that exists (D-25). Do not invent missing dark/light twins.

Hash routes for the five-item nav (D-11/D-13):

| Approved file | Route hash | Theme |
|---------------|------------|-------|
| `02-rechnung-light.png` | `#/` | light |
| `03-rechnung-dark.png` | `#/` | dark |
| `04-entities-light.png` | `#/entities` | light |
| `05-entities-dark.png` | `#/entities` | dark |
| `06-tax-engine.png` | `#/tax` | available (single) |
| `07-pdf-viewer.png` | `#/pdf` | available (single) |

Each capture filename **must** match the approved basename.

## Diff

```bash
node apps/desktop/scripts/pixel-diff.mjs --manifest .planning/phases/04-premium-ui-brand-redesign/mockups/approved --captures artifacts/captures --required '02-07' --themes available --threshold 0
```

- Equal dimensions + pixelmatch **threshold 0** → exit 0 (A1).
- Missing manifest entry, missing capture, dimension mismatch, or pixel mismatch → non-zero.
- Diff PNGs: `artifacts/captures/diff-<basename>.png`.

QA gate:

```bash
node apps/desktop/scripts/verify-pixel-qa.mjs .planning/phases/04.1-stitch-react-5-route-conversion/04.1-QA.md --require-all --block-fail-without-residual-decision
```

A FAIL row **alone** is not done (D-09/D-27). Either PASS, or a **named human residual decision** (`<!-- residual-decision: {id,decision,diff,owner,scope} -->`) that authorizes Phase 6 transfer. Do not auto-approve. Do not restyle the five routes to force PASS (Phase 06 owns 1:1 closure).
