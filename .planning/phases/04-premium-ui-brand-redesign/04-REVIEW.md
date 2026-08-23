---
phase: 04-premium-ui-brand-redesign
reviewed: 2026-08-23T03:45:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - apps/desktop/index.html
  - apps/desktop/src/lib/theme.ts
  - apps/desktop/src/lib/theme.test.ts
  - apps/desktop/src/components/splash.tsx
  - apps/desktop/src/App.tsx
  - packages/ui/src/components/combobox.tsx
  - apps/desktop/src/routes/rechnung.tsx
  - apps/desktop/tsconfig.json
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
prior_review: 2026-08-23T01:36:00Z
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-23T03:45:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found
**Scope:** gap-closure plan 04-04 (G-04-1, G-04-2, G-04-3)

## Summary

Adversarial re-review of 04-04 source. Prior 04-REVIEW (25 files, 2026-08-23T01:36:00Z) warnings WR-02 (`color-scheme` on `:root`/`.dark`) and WR-03 (empty-state CTA vs focus) are closed on current tree. Prior WR-01 (no blocking boot paint; persist-before-class) is closed for **cold launch**: `index.html` IIFE paints html/body with D-02 `#F7F7F5` / `#111110`, `applyTheme` paints then best-effort `setItem`.

04-04 still leaves incorrect paint after boot, a dark-splash fallback hole, and a picker empty-value path. No critical/security findings. ComboboxInput no longer `render={<InputGroupButton`. Invoice Select items use `value={row.id}` + `invoiceLabel`. Splash hold 700ms (0 in test) is in `App.tsx`.

## Prior findings (disposition)

| ID | Disposition |
|---|---|
| WR-01 FOUC / persist-before-class | Closed for first paint. Residual: WR-01 below (OS change does not call `paintDocument`). |
| WR-02 native `color-scheme` | Closed (`globals.css` `:root` / `.dark`). |
| WR-03 empty CTA | Closed (`InvoiceEmptyState` label `Neue Rechnung` + `onStart={startNewDraft}`). |
| IN-01 theme-menu swallow | Closed (`console.warn` in `theme-menu.ts`; out of this file list). |
| IN-02 token sheet drift | Still open; widened — boot hex ≠ `--background` (IN-01). |
| IN-03 unused `splash.png` | Accepted by 04-04 (type-only D-16). Dropped from this report. |

## Warnings

### WR-01: OS `system` change toggles `.dark` but does not repaint html/body

**File:** `apps/desktop/src/main.tsx:10-16` (caller), `apps/desktop/src/lib/theme.ts:17-35`
**Issue:** 04-04 made inline `background` / `color-scheme` on `documentElement` and `body` the FOUC source of truth. The only OS listener still only does `classList.toggle("dark", resolveDark("system"))`. Inline styles win over `body { @apply bg-background }`, so a `clared-theme=system` user who flips OS appearance keeps the **previous** oatmeal/charcoal canvas and `color-scheme` while `.dark` / tokens update. `#clared-boot-paint` is never rewritten either. `applyTheme("system")` would paint; the listener never calls it. Tests never cover this path.
**Fix:** Reuse `applyTheme` (persist is idempotent) or `paintDocument`:

```ts
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (currentPref() === "system") {
      applyTheme("system");
    }
  });
```

Export `paintDocument` only if persist on OS change is unwanted; then still update html/body + `#clared-boot-paint`.

### WR-02: Splash fallback is Light-only before CSS variables exist

**File:** `apps/desktop/src/components/splash.tsx:10-21`
**Issue:** Plan G-04-3: splash must paint with inline styles **before** Tailwind/CSS. Root uses `background: "var(--background, #F7F7F5)"` and `color: "var(--foreground, #111110)"`. Unset `--background` always falls back to oatmeal. Boot IIFE may already have `.dark` and charcoal on html/body; Splash is `minHeight: 100vh` and covers that with Light until tokens apply. Dark cold launch can flash oatmeal splash. After CSS, `--background` is `#ffffff` / `#0f1113`, not D-02 `#F7F7F5` / `#111110`, so splash also disagrees with boot paint.
**Fix:** Resolve dark the same way as boot (`document.documentElement.classList.contains("dark")` or `resolveDark(currentPref())`) and set hex `#111110` / `#F7F7F5` (and matching foreground) on the splash root — do not depend on `var(--background)` for the CSS-less window.

### WR-03: Unnumbered draft Select value is `""` (not in item list)

**File:** `apps/desktop/src/routes/rechnung.tsx:406-411`, `506-518`
**Issue:** G-04-1: visible picker text is `invoiceLabel`; control value is invoice id. `startNewDraft` sets `draftId` to `null` and `isUnnumberedDraft` true. Select is `value={draftId ?? ""}` while `SelectItem` values are only `row.id`. `""` matches nothing. Radix `SelectValue` with a defined empty value does not reliably show `placeholder={pickerLabel}` (`Neue Rechnung`). Header also hides the `Neue Rechnung` sibling (`pickerLabel !== "Neue Rechnung"`). User with existing drafts who clicks **Neue Rechnung** can get a blank trigger — object-string bug is gone, label contract is not met on this path.
**Fix:** Keep a display string on the trigger when `isUnnumberedDraft` (e.g. `SelectValue placeholder="Neue Rechnung"` only when `value` is `undefined`, or a disabled extra item `value="new"` with `invoiceLabel`). Do not use `""` as a sentinel if it is not a `SelectItem` value.

## Info

### IN-01: D-02 boot hex and CSS `--background` disagree

**File:** `apps/desktop/src/lib/theme.ts:4-6`, `apps/desktop/index.html:10-11` vs `apps/desktop/src/styles/globals.css:32-60` (token sheet; out of this file list)
**Issue:** First paint is Pale Oatmeal `#F7F7F5` / Deep Charcoal `#111110`. `:root --background` is `#ffffff`; `.dark --background` is `#0f1113`. After CSS, `AppShell` `bg-background` is not the boot canvas. Overscroll / html/body inline vs app chrome can seam.
**Fix:** Point `--background` at D-02 hex, or paint boot with the token hex. One pair of values.

### IN-02: Boot IIFE duplicates `currentPref` / `resolveDark` / paint hex

**File:** `apps/desktop/index.html:8-53`, `apps/desktop/src/lib/theme.ts:4-15`
**Issue:** Comment says keep in sync. Key `"clared-theme"`, pref whitelist, matchMedia query, and hex live twice. Drift reopens G-04-2.
**Fix:** Comment both sites with the four literals, or a tiny `theme-boot.js` imported from `index.html` and copied into tests. No runtime TS in `<head>` without a blocking classic script.

### IN-03: App `tsconfig` excludes `theme.test.ts`

**File:** `apps/desktop/tsconfig.json:19-20`
**Issue:** `"exclude": ["src/**/*.test.ts"]` means `applyTheme` paint tests never run under desktop `tsc --noEmit`. Vitest still executes them; type drift in the stub `Storage` / `matchMedia` is invisible to app typecheck.
**Fix:** Include tests in a `tsconfig.vitest.json` (or drop the exclude if `noUnusedLocals` is the only reason).

---

_Reviewed: 2026-08-23T03:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Plan: 04-04 gap closure_
