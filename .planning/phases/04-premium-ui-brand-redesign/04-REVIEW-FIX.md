---
phase: 04-premium-ui-brand-redesign
fixed_at: 2026-08-23T01:47:28Z
review_path: .planning/phases/04-premium-ui-brand-redesign/04-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 5
skipped: 1
status: partial
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-08-23T01:47:28Z
**Source review:** `.planning/phases/04-premium-ui-brand-redesign/04-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 5
- Skipped: 1

**Verification:** Tier 1 re-read of each modified section in isolated worktree `.claude/worktrees/rf-04-8784-1787449424`. No `node_modules` in that worktree — Tier 2 `tsc` not run there. Fixes fast-forwarded onto `gsd/phase-04-premium-ui-brand-redesign`.

## Fixed Issues

### WR-01: Dark theme still requires JS; Light `:root` can flash

**Files modified:** `apps/desktop/src/lib/theme.ts`, `apps/desktop/index.html`
**Commit:** `0944b4f`
**Applied fix:** `applyTheme` toggles `.dark` before `localStorage.setItem` (persist in `try/catch`). `currentPref` wraps storage reads in `try/catch`. Blocking `<head>` script applies stored/system dark class before module CSS paint.
**Status:** fixed

### WR-02: Native form controls ignore Crafted Dark

**Files modified:** `apps/desktop/src/styles/globals.css`, `packages/ui/src/styles/globals.css`
**Commit:** `a589b4c`
**Applied fix:** Added `color-scheme: light` on `:root` and `color-scheme: dark` on `.dark` in both token sheets.
**Status:** fixed

### WR-03: Empty-state CTA copy does not match behavior

**Files modified:** `apps/desktop/src/components/invoice-empty-state.tsx`
**Commit:** `4835dfe`
**Applied fix:** Label → `Rechnung beginnen`; focus target → `#entity-picker` (`SelectTrigger` on empty Rechnung form). No sample invoice restored.
**Status:** fixed: requires human verification

### IN-01: Darstellung install swallows all errors

**Files modified:** `apps/desktop/src/lib/theme-menu.ts`
**Commit:** `75e1b54`
**Applied fix:** Catch logs `console.warn("[theme-menu] Darstellung menu install failed:", err)` so ACL/API failures are visible in devtools.
**Status:** fixed

### IN-03: `splash.png` is unused by launch splash

**Files modified:** `apps/desktop/src/components/splash.tsx`
**Commit:** `7dde390`
**Applied fix:** Comment at Splash noting D-16 wordmark+spinner; `public/splash.png` left unwired until UAT asks.
**Status:** fixed

## Skipped Issues

### IN-02: Token sheets can drift

**File:** `apps/desktop/src/styles/globals.css`, `packages/ui/src/styles/globals.css`
**Reason:** skipped: too large — unifying or adding a sync check for duplicated `:root`/`.dark` token blocks is cross-cutting (build script or shared import), not a surgical one-file fix.
**Original issue:** Light/Dark token blocks are duplicated by hand; a one-sided edit desyncs Crafted Minimal.

---

_Fixed: 2026-08-23T01:47:28Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
