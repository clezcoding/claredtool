---
phase: 04-premium-ui-brand-redesign
reviewed: 2026-08-23T01:36:00Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - apps/desktop/src-tauri/capabilities/default.json
  - apps/desktop/src/App.tsx
  - apps/desktop/src/__tests__/auth-gate.test.tsx
  - apps/desktop/src/__tests__/session-banner.test.tsx
  - apps/desktop/src/auth/login-gate.tsx
  - apps/desktop/src/components/error-state.tsx
  - apps/desktop/src/components/invoice-empty-state.tsx
  - apps/desktop/src/components/line-item-card.tsx
  - apps/desktop/src/components/pdf-paper.tsx
  - apps/desktop/src/components/session-banner.tsx
  - apps/desktop/src/components/session-chip.tsx
  - apps/desktop/src/components/splash.tsx
  - apps/desktop/src/components/tax-rail.tsx
  - apps/desktop/src/data/tax-live-store.ts
  - apps/desktop/src/lib/theme-menu.ts
  - apps/desktop/src/lib/theme.test.ts
  - apps/desktop/src/lib/theme.ts
  - apps/desktop/src/main.tsx
  - apps/desktop/src/routes/entities.tsx
  - apps/desktop/src/routes/kunden.tsx
  - apps/desktop/src/routes/pdf.tsx
  - apps/desktop/src/routes/rechnung.tsx
  - apps/desktop/src/routes/tax.tsx
  - apps/desktop/src/styles/globals.css
  - packages/ui/src/styles/globals.css
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues
advisory: true
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-23T01:36:00Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues (advisory — do not block)

## Summary

Reviewed source changed from `5751361` (04-01 RED) through `387d765` on `gsd/phase-04-premium-ui-brand-redesign`, plus the key-files named in 04-01/02/03 SUMMARY. Binary PNGs were out of scope.

Focus checks:

- **Theme persist:** `clared-theme` write/read works; unknown values fall back to `"system"` via `PREFS.has`.
- **FOUC:** class toggle runs before `ReactDOM.createRoot().render`, but Light `:root` has no CSS-level dark fallback — residual flash risk (WR-01).
- **D-09:** `PdfPaper` keeps inline `#fff` / `#111`; no `invert` / tokenized paper colors. Tax-rail mini-preview keeps inline `#fff`.
- **Session chip:** identity + `Abmelden` only; no Darstellung/theme item.
- **Hex in restyled routes:** none in `rechnung` / `tax` / `pdf` / `entities` / `kunden` / `login-gate`.
- **Numeric coercion:** `Number(...) || 0` on line-item menge/einzelpreis unchanged.

No critical/security findings. Three warnings; phase may proceed.

## Warnings

### WR-01: Dark theme still requires JS; Light `:root` can flash

**File:** `apps/desktop/src/styles/globals.css:32-54`, `apps/desktop/src/main.tsx:8`, `apps/desktop/index.html:1-12`
**Issue:** `:root` is unconditionally the Light palette. Dark only exists on `.dark`. `applyTheme(currentPref())` runs after the module graph (including CSS) evaluates; `index.html` has no blocking boot script; the Tauri window has no `background` color. Previously forced-dark meant the first stylesheet paint was already Dark. A stored `dark` pref, OS-dark `system`, or a throw in `localStorage` / `matchMedia` on the boot path leaves Light tokens (or a white webview) on screen. `applyTheme` also persists *before* toggling the class, so a `setItem` throw skips the class toggle entirely.
**Fix:** Toggle the class first, persist in `try/catch`, and give CSS a no-JS dark path (blocking `<head>` script and/or `color-scheme` + `@media (prefers-color-scheme: dark)` fallback on `:root:not(.light)`). Optionally set the window background in `tauri.conf.json`.

```ts
export function applyTheme(pref: ThemePref): void {
  document.documentElement.classList.toggle("dark", resolveDark(pref));
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // persist is best-effort; class already applied
  }
}

export function currentPref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && PREFS.has(stored) ? (stored as ThemePref) : "system";
  } catch {
    return "system";
  }
}
```

### WR-02: Native form controls ignore Crafted Dark

**File:** `apps/desktop/src/styles/globals.css:32-76`
**Issue:** Neither `:root` nor `.dark` sets `color-scheme`. Rechnung `type="date"` / `type="number"` inputs (and other UA widgets) stay Light-themed inside a Dark shell after Darstellung → Dunkel.
**Fix:**

```css
:root {
  color-scheme: light;
  /* existing tokens */
}
.dark {
  color-scheme: dark;
  /* existing tokens */
}
```

Mirror the same two lines in `packages/ui/src/styles/globals.css`.

### WR-03: Empty-state CTA copy does not match behavior

**File:** `apps/desktop/src/components/invoice-empty-state.tsx:18-26`
**Issue:** Button label is `Beispielrechnung anzeigen`. Click only focuses `#rechnungsnummer`, a **read-only** field on the empty form. No sample invoice is shown. Users who take the label literally get no example; keyboard focus lands on a control they cannot edit.
**Fix:** Change the label to match the handler (e.g. `Rechnung beginnen`) and focus the first editable field (`#entity-picker` or the first line-item input). Do not restore `SAMPLE_INVOICE` (Phase 3 lock).

## Info

### IN-01: Darstellung install swallows all errors

**File:** `apps/desktop/src/lib/theme-menu.ts:45-47`
**Issue:** Bare `catch` hides ACL / API failures. Shell runs, but UAT cannot tell why the native menu is missing.
**Fix:** `console.warn` the error in dev, or rethrow when `isTauriRuntime()` is true.

### IN-02: Token sheets can drift

**File:** `apps/desktop/src/styles/globals.css`, `packages/ui/src/styles/globals.css`
**Issue:** Light/Dark token blocks are duplicated by hand (ui copy also has `@source` lines). A one-sided edit desyncs Crafted Minimal.
**Fix:** One source of token values, or a check that the `:root` / `.dark` blocks stay identical.

### IN-03: `splash.png` is unused by launch splash

**File:** `apps/desktop/src/components/splash.tsx:3-8`, `apps/desktop/public/splash.png`
**Issue:** D-16 keeps wordmark + spinner; `public/splash.png` is shipped but never referenced. Harmless dead asset unless UAT expected the illustration.
**Fix:** Wire it only if UAT asks; otherwise leave a comment at the import site or drop the file later.

---

_Reviewed: 2026-08-23T01:36:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Advisory: true_
