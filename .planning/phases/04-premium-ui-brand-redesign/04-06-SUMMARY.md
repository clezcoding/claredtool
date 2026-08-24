---
phase: 04-premium-ui-brand-redesign
plan: 06
subsystem: ui
tags: [css-tokens, theme, fouc, d-02, vitest]

requires:
  - phase: 04-premium-ui-brand-redesign
    provides: applyTheme html+body paint, boot IIFE Pale Oatmeal / Deep Charcoal, dual globals.css trees
provides:
  - :root/.dark --background aligned to #F7F7F5 / #111110 in desktop and packages/ui
  - light --card/--popover Pure White so oatmeal canvas stays distinct
  - exported PAINT_LIGHT / PAINT_DARK plus file-level SSOT tests
affects: [phase-04-uat, first-paint, bg-background]

actuals:
  tokens: 1129
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns: [canvas hex SSOT: IIFE + PAINT_* + --background]

key-files:
  created: []
  modified:
    - apps/desktop/src/styles/globals.css
    - packages/ui/src/styles/globals.css
    - apps/desktop/src/lib/theme.ts
    - apps/desktop/src/lib/theme.test.ts

key-decisions:
  - "Kept existing PAINT_LIGHT / PAINT_DARK names (already matched IIFE hexes); exported them instead of renaming to PAINT_*."
  - "html also @apply bg-background in desktop @layer base so CSS cannot overwrite the boot IIFE with UA white."
  - "Task 3 was verify-only (D-08 mirror + LoginGate + PdfPaper); no extra commit."

patterns-established:
  - "Canvas SSOT: theme.test.ts reads index.html, both globals.css, and theme.ts export const PAINT_*."

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: Light canvas Pale Oatmeal #F7F7F5, dark Deep Charcoal #111110, light cards Pure White in both globals.css trees
    requirement: BRAND-01
    verification:
      - kind: other
        ref: python3 canvas token parse on both globals.css
        status: pass
    human_judgment: false
  - id: D2
    description: Exported PAINT_LIGHT / PAINT_DARK locked to boot IIFE and both CSS --background values
    requirement: UI-01
    verification:
      - kind: unit
        ref: apps/desktop/src/lib/theme.test.ts#PAINT_* match boot IIFE and both globals.css --background tokens
        status: pass
    human_judgment: false
  - id: D3
    description: D-08 token twins; LoginGate still open_login_window; PdfPaper inline #fff/#111
    verification:
      - kind: other
        ref: python3 D-08 mirror + login-gate + pdf-paper asserts
        status: pass
      - kind: unit
        ref: apps/desktop/src/__tests__/auth-gate.test.tsx
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 06: Canvas SSOT + FOUC Summary

**Pale Oatmeal / Deep Charcoal --background now matches boot IIFE and applyTheme; CSS cannot drift without failing theme.test.ts**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-23T21:33:09Z
- **Completed:** 2026-08-23T21:39:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Both globals.css trees use `:root --background #F7F7F5` and `.dark --background #111110`.
- Light `--card` / `--popover` are `#FFFFFF` so raised surfaces sit on oatmeal.
- Desktop `@layer base` paints `html` with `bg-background` as well as `body`.
- `PAINT_LIGHT` / `PAINT_DARK` exported from `theme.ts`; file SSOT test covers IIFE + both CSS files.
- LoginGate Authentik SSO (`open_login_window`), PdfPaper always-light, `SPLASH_HOLD_MS` unchanged.

## Task Commits

1. **Task 1: End-to-end D-02 canvas** — `ac21329` (feat)
2. **Task 2 RED: SSOT tests** — `675af54` (test)
3. **Task 2 GREEN: export PAINT_*** — `23dadc8` (feat)
4. **Task 3: D-08 / SSO / PdfPaper confirm** — no commit (verify-only)

## Files Created/Modified

- `apps/desktop/src/styles/globals.css` — oatmeal canvas, white cards, html bg-background
- `packages/ui/src/styles/globals.css` — same --background/--card pair (D-08)
- `apps/desktop/src/lib/theme.ts` — export PAINT_LIGHT / PAINT_DARK
- `apps/desktop/src/lib/theme.test.ts` — IIFE + CSS + export SSOT

## Decisions Made

- Export existing `PAINT_LIGHT` / `PAINT_DARK` rather than rename; hexes already matched `index.html`.
- Did not rewrite splash or LoginGate (D-13, D-16). PdfPaper inline paper colors left (D-09).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SSOT test path to index.html**
- **Found during:** Task 2 (RED)
- **Issue:** `../../../index.html` from `src/lib` resolved to `apps/index.html` (ENOENT).
- **Fix:** `../../index.html` (`apps/desktop/index.html`). Added `export const PAINT_*` source asserts so RED failed until exports existed.
- **Files modified:** `apps/desktop/src/lib/theme.test.ts`
- **Verification:** vitest 15 passed after GREEN
- **Committed in:** `675af54` (RED) / `23dadc8` (GREEN)

**2. [Rule 3 - Blocking] Dirty globals.css mixed serif/money WIP**
- **Found during:** Task 1
- **Issue:** Working tree had unrelated `--font-serif` / `.money-display` and a dark `--background: #0f1113` drift.
- **Fix:** Copied WIP aside, restored HEAD copies, applied only canvas token + html rule. Unrelated WIP not committed.
- **Files modified:** both `globals.css` (plan hunks only)
- **Verification:** python G-04-1 parse
- **Committed in:** `ac21329`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking dirty-tree)
**Impact on plan:** Required for correct SSOT test and clean atomic commits. No scope creep.

## Issues Encountered

None beyond the path and dirty-tree handling above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

G-04-1 and G-04-2 closed in code. Remaining human UAT: G-04-3 (reduced-motion + live OS appearance), cold-launch FOUC eyeball, signed-in 5-item shell craft. Phase 5 PDF/offline/audit still out of scope.

## Self-Check: PASSED

- FOUND: `.planning/phases/04-premium-ui-brand-redesign/04-06-SUMMARY.md`
- FOUND: `ac21329`, `675af54`, `23dadc8`

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*
