---
phase: 04-premium-ui-brand-redesign
reviewed: 2026-08-23T05:15:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - apps/desktop/src/main.tsx
  - apps/desktop/src/lib/theme.ts
  - apps/desktop/src/lib/theme.test.ts
  - apps/desktop/src/components/invoice-empty-state.tsx
  - apps/desktop/src/__tests__/phase03-autosave.test.tsx
  - apps/desktop/src/auth/login-gate.tsx
  - apps/desktop/src/__tests__/auth-gate.test.tsx
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
prior_review: 2026-08-23T03:45:00Z
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-23T05:15:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found
**Scope:** gap-closure plan 04-05 (G-04-4, G-04-5, G-04-6)

## Summary

Adversarial review of 04-05 source only. No critical/security findings. `PREFS` still gates `localStorage`; `syncSystemAppearance` no-ops unless pref is `system`; login/empty heroes stay first-party `/…png` paths; `invoke("open_login_window")` is a fixed command.

G-04-6 closes 04-04 WR-01: `main.tsx` calls `syncSystemAppearance()` which `applyTheme("system")` + `paintDocument`. G-04-4 CTA string and G-04-5 hero/`font-sans` match the plan. Remaining defects: LoginGate primary CTA ignores `openingLogin` and can reject unhandled; locale chip contrast in dark; Enter auth test is a click test; leftover boot-paint stylesheet and D-02 vs `--background` drift.

## Prior findings (disposition)

| ID | From | Disposition |
|---|---|---|
| WR-01 OS `system` change does not paint html/body | 04-04 | Closed. `syncSystemAppearance` + tests in `theme.test.ts`. Residual: IN-03 (`#clared-boot-paint` stylesheet still stale). |
| WR-02 Splash Light-only fallback | 04-04 | Still open in `splash.tsx` (out of 04-05 file list). |
| WR-03 Unnumbered draft Select `value=""` | 04-04 | Still open in `rechnung.tsx` (out of 04-05 file list). |
| IN-01 D-02 boot hex vs CSS `--background` | 04-04 | Still open (IN-01 below). |
| IN-02 Boot IIFE duplicates theme literals | 04-04 | Still open (IN-02 below). |
| IN-03 App tsconfig excludes `theme.test.ts` | 04-04 | Still open (`tsconfig.json` out of this file list). |

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: LoginGate primary CTA ignores `openingLogin` and drops invoke errors

**File:** `apps/desktop/src/auth/login-gate.tsx:14-20`, `70-77`
**Issue:** With `SessionContext` present (production), `handleLogin` awaits `session.login()` which sets `openingLogin` and invokes `open_login_window`. The banner button receives `opening={session.openingLogin}` and shows a spinner. The card **Anmelden** / **Sign In** button does not: no `disabled`, no spinner, `onClick={() => void handleLogin()}`. Double-click (or banner + card) can fire two `open_login_window` invokes. `void` discards the promise; if `invoke` rejects, that is an unhandled rejection and the CTA stays enabled. The no-session fallback (`await invoke("open_login_window")`) has the same gap (test path).
**Fix:**

```tsx
async function handleLogin() {
  try {
    if (session) {
      await session.login();
      return;
    }
    await invoke("open_login_window");
  } catch (error) {
    console.warn("open_login_window failed", error);
  }
}

<Button
  type="button"
  autoFocus
  className={CTA_CLASS}
  disabled={session?.openingLogin}
  onClick={() => void handleLogin()}
>
  {session?.openingLogin ? <Spinner /> : null}
  {locale === "de" ? "Anmelden" : "Sign In"}
</Button>
```

### WR-02: Locale chip uses `text-foreground` on `bg-primary` (dark contrast)

**File:** `apps/desktop/src/auth/login-gate.tsx:27-34`
**Issue:** Selected EN/DE uses `bg-primary text-foreground`. `--primary` is `#a8bfa3` in both schemes. Light `--foreground` `#111110` on sage is fine. Dark `--foreground` is `#f7f7f5` on the same sage — two light values, `text-xs` chip copy. SessionBanner already uses `text-primary-foreground` (`#111110`) on `bg-primary`.
**Fix:** Selected class `bg-primary text-primary-foreground`. Add `aria-pressed={locale === "en"}` / `aria-pressed={locale === "de"}` on the two buttons.

### WR-03: “Enter on Anmelden” test never proves Enter

**File:** `apps/desktop/src/__tests__/auth-gate.test.tsx:35-47`
**Issue:** Test name claims Enter opens the login window. Sequence is `fireEvent.submit` on a non-form (`button.closest("form")` is null, so submit targets the button), `keyDown` Enter (no `onKeyDown` on `Button`), then `fireEvent.click(button)`. Assertion passes because of the click. Keyboard contract can regress without a red test.
**Fix:** Drop the click. Focus the button and `userEvent.keyboard("{Enter}")` (or `fireEvent.keyDown` only if the harness maps it to click), and assert `tauriInvoke` was called. If native button Enter is the contract, do not also click.

## Info

### IN-01: D-02 boot hex and CSS `--background` disagree

**File:** `apps/desktop/src/lib/theme.ts:4-6` vs `apps/desktop/src/styles/globals.css:32-60` (token sheet; out of this file list)
**Issue:** `paintDocument` uses Pale Oatmeal `#F7F7F5` / Deep Charcoal `#111110`. `:root --background` is `#ffffff`; `.dark --background` is `#0f1113`. After CSS, `bg-background` (LoginGate root included) is not the boot canvas. Overscroll / html inline vs app chrome can seam.
**Fix:** Point `--background` at D-02 hex, or paint boot with the token hex. One pair of values.

### IN-02: Boot IIFE duplicates `currentPref` / `resolveDark` / paint hex

**File:** `apps/desktop/index.html` (out of this file list) vs `apps/desktop/src/lib/theme.ts:4-15`
**Issue:** Key `"clared-theme"`, pref whitelist, matchMedia query, and hex live twice. Drift reopens G-04-2 / G-04-6.
**Fix:** Comment both sites with the four literals, or a tiny classic `theme-boot.js` shared with the IIFE. No runtime TS in `<head>` without a blocking classic script.

### IN-03: `#clared-boot-paint` stylesheet not updated on OS sync

**File:** `apps/desktop/src/lib/theme.ts:17-26`, `apps/desktop/src/main.tsx:10-14`
**Issue:** Boot IIFE writes `html,body{background;color-scheme}` into `#clared-boot-paint`. `paintDocument` only sets inline styles on `documentElement` and `body`. Inline usually wins, so G-04-6 still paints. The stylesheet keeps the cold-boot colors until reload; any consumer that reads that rule (or a later `!important`) can disagree.
**Fix:** In `paintDocument`, also set `#clared-boot-paint` `textContent` the same way as `index.html`, or drop the style tag once JS owns inline paint.

### IN-04: Empty-state focus fallback cannot reach `#entity-picker`

**File:** `apps/desktop/src/components/invoice-empty-state.tsx:21-27`
**Issue:** Without `onStart`, click tries `document.getElementById("entity-picker")?.focus()`. `rechnung.tsx` renders `InvoiceEmptyState` as an early `return`, so the picker is not mounted. Production always passes `onStart={startNewDraft}` (plan: do not restore `SAMPLE_INVOICE`). The fallback is a silent no-op; CTA copy “Beispielrechnung anzeigen” is the required UI-SPEC string, not a sample restore.
**Fix:** Drop the `getElementById` branch, or make `onStart` required. Keep the accessible name the plan requires.

---

_Reviewed: 2026-08-23T05:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Plan: 04-05 gap closure_
