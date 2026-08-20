---
phase: 01-tauri-desktop-mockup-first-ui
reviewed: 2026-08-19T14:16:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - apps/desktop/src/main.tsx
  - apps/desktop/src/App.tsx
  - apps/desktop/src/data/sample-invoice.ts
  - apps/desktop/src/routes/rechnung.tsx
  - apps/desktop/src/routes/pdf.tsx
  - apps/desktop/src/routes/entities.tsx
  - apps/desktop/src/routes/kunden.tsx
  - apps/desktop/src/routes/tax.tsx
  - apps/desktop/src/components/line-item-card.tsx
  - apps/desktop/src/components/tax-rail.tsx
  - apps/desktop/src/components/invoice-empty-state.tsx
  - apps/desktop/src/components/pdf-paper.tsx
  - apps/desktop/src/components/create-disabled-button.tsx
  - packages/ui/src/index.ts
  - packages/ui/src/components/button.tsx
  - packages/ui/src/components/card.tsx
  - apps/desktop/src-tauri/src/lib.rs
  - apps/desktop/src-tauri/tauri.conf.json
  - .github/workflows/desktop-build.yml
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-08-19T14:16:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Reviewed the Phase 1 Tauri mock (HashRouter shell, invoice canvas, Entities/Kunden/Tax, HTML PDF paper, UI primitives, Tauri entrypoint, CI workflow). No persist / no tax engine / no real PDF were treated as in-scope product constraints, not defects.

UI routes are coherent for a clickable mock: sample data math is consistent (`8×180 + 4×160 = 2080`), empty-state copy matches the UI contract, and `@clared/ui` Card/Button wiring is sound. Issues are least-privilege and CI reproducibility — the shipped capability set is wider than the Phase 1 threat model claimed, and the Windows evidence workflow can drift.

## Warnings

### WR-01: Unused opener plugin grants URL and file-reveal IPC

**File:** `apps/desktop/src-tauri/src/lib.rs:4`
**Issue:** `tauri_plugin_opener::init()` is registered and `capabilities/default.json` grants `opener:default`. That permission set allows `open_url` for `http://*`, `https://*`, `mailto:*`, `tel:*`, plus `reveal_item_in_dir` with no path scope. No frontend code imports `@tauri-apps/plugin-opener` or calls `invoke`. Phase 1 threat model T-01-02 claimed filesystem/allowlist capabilities were off and Tauri default was deny-all — that is false in the built app. Any compromised bundle JS can open arbitrary http(s) URLs in the system browser or reveal filesystem locations. Least privilege for a mock that never opens links: drop the plugin.
**Fix:** Remove the plugin registration, the `opener:default` permission, and the unused JS/Cargo deps:

```rust
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```json
"permissions": ["core:default"]
```

Also drop `tauri-plugin-opener` from `apps/desktop/src-tauri/Cargo.toml` and `@tauri-apps/plugin-opener` from `apps/desktop/package.json`.

### WR-02: CI toolchain action tracks a moving `stable` pointer

**File:** `.github/workflows/desktop-build.yml:29`
**Issue:** T-01-12 (high, mitigate) required pinning the Rust toolchain action to a released tag. `dtolnay/rust-toolchain@stable` follows the action's `stable` branch and installs whatever rustc `stable` is that day. A yanked/compromised action revision or a breaking rustc bump fails or alters the DESK-01 Windows evidence job without a lockfile change.
**Fix:** Pin the action to a release tag (or SHA) and pin the toolchain:

```yaml
- uses: dtolnay/rust-toolchain@v1
  with:
    toolchain: stable
```

Prefer a commit SHA for the action (`dtolnay/rust-toolchain@<sha>`) and a dated Rust channel (`1.89.0`) once the first green Windows build exists.

### WR-03: CI `pnpm install` is not reproducible

**File:** `.github/workflows/desktop-build.yml:31`
**Issue:** `pnpm install` without `--frozen-lockfile` can resolve newer versions than `pnpm-lock.yaml` when the lockfile is out of date or a range floats. That undercuts the same T-01-12 package-legitimacy mitigation the Windows MSI is supposed to evidence. Root already declares `packageManager: pnpm@11.15.1`; the workflow only asks pnpm `version: 11`.
**Fix:**

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 11.15.1

- run: pnpm install --frozen-lockfile
```

### WR-04: Disabled Anlegen hint is not attached to the button

**File:** `apps/desktop/src/components/create-disabled-button.tsx:5-9`
**Issue:** The Phase-3 hint is a sibling `<p>` with no programmatic association. `Button` also sets `disabled:pointer-events-none`. Assistive tech gets “Anlegen, dimmed” without “Wird in Phase 3 aktiviert”, so the D-31 mock is not explained to keyboard/screen-reader users.
**Fix:**

```tsx
export function CreateDisabledButton() {
  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" disabled aria-describedby="create-disabled-hint">
        Anlegen
      </Button>
      <p id="create-disabled-hint" className="text-xs text-muted-foreground">
        Wird in Phase 3 aktiviert
      </p>
    </div>
  );
}
```

## Info

### IN-01: CSP is explicitly disabled

**File:** `apps/desktop/src-tauri/tauri.conf.json:24`
**Issue:** `"csp": null` disables Content Security Policy. T-01-03 accepted this for the local mockup; it is still the first thing to tighten before any network or untrusted HTML. Not a Phase 1 ship blocker.
**Fix:** Before Phase 2 IPC/network, set a restrictive CSP (default-src `'self'`, connect-src limited to the IPC/asset protocol) instead of `null`.

### IN-02: Rechnung CTAs bypass `@clared/ui` Button

**File:** `apps/desktop/src/routes/rechnung.tsx:43-48`
**Issue:** `Neue Rechnung` and `+ Position` are raw `<button>` elements with duplicated primary classes, while Entities/Kunden use `Button`. Intentional per 01-03, but the two styles will drift (focus rings, disabled treatment).
**Fix:** Use `Button` from `@clared/ui` for those two controls when convenient; default `type="button"` on the primitive so later forms cannot implicit-submit.

### IN-03: Line-item state shares mutable sample / blank objects

**File:** `apps/desktop/src/routes/rechnung.tsx:22-28`
**Issue:** `useState(SAMPLE_INVOICE.lineItems)` and `restoreSample` store the canonical array by reference. `+ Position` appends the module-level `BLANK_LINE` object, so every blank row is the same instance. Display-only cards hide this today; the first in-place edit will mutate `SAMPLE_INVOICE` or all blanks at once.
**Fix:** Clone on init, restore, and append:

```ts
useState<LineItem[]>(() => SAMPLE_INVOICE.lineItems.map((item) => ({ ...item })))
setLineItems((current) => [...current, { ...BLANK_LINE }])
```

---

_Reviewed: 2026-08-19T14:16:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
