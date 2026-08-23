---
phase: 04-premium-ui-brand-redesign
plan: 04
subsystem: ui
tags: [fouc, splash, combobox, invoice-picker, crafted-minimal, vitest]

requires:
  - phase: 04-premium-ui-brand-redesign
    provides: theme.ts resolveDark/applyTheme/currentPref, splash, 5-item shell
provides:
  - D-02 oatmeal/charcoal first paint on html and body (G-04-2)
  - Inline Clared splash ring plus 700ms hold (G-04-3)
  - Invoice picker id + invoiceLabel; ComboboxClear unnested (G-04-1)
  - REQUIREMENTS PDF-01 OFFL-01 AUDT-01 traceability Phase 5
affects: [verify-work, phase-05, desktop-boot]

actuals:
  tokens: 9037
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "Boot IIFE and applyTheme share D-02 hex and color-scheme on html+body"
    - "Head-script body paint via injected html,body CSS until body exists"
    - "ComboboxClear is the primitive button, not InputGroupButton render"

key-files:
  created: []
  modified:
    - apps/desktop/index.html
    - apps/desktop/src/lib/theme.ts
    - apps/desktop/src/lib/theme.test.ts
    - apps/desktop/src/components/splash.tsx
    - apps/desktop/src/App.tsx
    - packages/ui/src/components/combobox.tsx
    - apps/desktop/src/routes/rechnung.tsx
    - .planning/REQUIREMENTS.md

key-decisions:
  - "First-paint hex is Pale Oatmeal #F7F7F5 / Deep Charcoal #111110, not UA white or the old #0f1113 boot colors"
  - "Head IIFE injects #clared-boot-paint for html,body then sets body.style on DOMContentLoaded so body exists after parse"
  - "Splash spinner is inline keyframes, not Tailwind Spinner; reduced-motion omits animation (D-17, not Darstellung)"
  - "PDF-01 OFFL-01 AUDT-01 stay Pending, remapped to Phase 5 only"

patterns-established:
  - "Pattern 1: applyTheme writes the same background and color-scheme the boot IIFE uses"
  - "Pattern 2: Invoice Select value is row.id; children/display use invoiceLabel"
  - "Pattern 3: ComboboxInput addon Clear must not render-compose InputGroupButton"

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: applyTheme paints html and body with D-02 oatmeal/charcoal and matching color-scheme
    requirement: BRAND-01
    verification:
      - kind: unit
        ref: apps/desktop/src/lib/theme.test.ts#applyTheme html and body paint
        status: pass
      - kind: other
        ref: pnpm --filter desktop exec vitest run src/lib/theme.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Cold-launch first paint is oatmeal or charcoal; Clared splash with inline spinner is observable
    requirement: BRAND-01
    verification:
      - kind: other
        ref: python assert index.html and splash.tsx D-02 hex / Clared / style=
        status: pass
    human_judgment: true
    rationale: Full-window FOUC and splash-before-LoginGate need a human OS Dark/Light cold launch
  - id: D3
    description: Invoice picker shows invoiceLabel; control value is invoice id; ComboboxClear is a single control
    requirement: UI-01
    verification:
      - kind: other
        ref: python assert invoiceLabel SelectItem value={row.id} and no InputGroupButton Clear render
        status: pass
    human_judgment: true
    rationale: Hydration nested-button and object-as-text in the picker are visual; UAT tests 1–3 re-run by human
  - id: D4
    description: Traceability rows PDF-01 OFFL-01 AUDT-01 list Phase 5 Pending
    verification:
      - kind: other
        ref: python assert Phase 5 and not Phase 4 on those REQUIREMENTS.md rows
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 04: Gap closure (FOUC, splash, picker) Summary

**Oatmeal/charcoal boot paint, inline Clared splash hold, invoiceLabel picker ids, and ComboboxClear unnested — Phase 5 remapped for PDF/offline/audit**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-23T03:33:30Z
- **Completed:** 2026-08-23T03:37:14Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Cold-launch IIFE and `applyTheme` paint `#F7F7F5` / `#111110` plus `color-scheme` on `html` and `body` (G-04-2).
- Splash is type-only **Clared** plus an inline ring; `AuthenticatedApp` holds Splash while `state === "boot"` or until 700ms (0 in test) (G-04-3).
- Rechnung picker `Select` value is `row.id` with `invoiceLabel` children; `ComboboxClear` no longer `render={<InputGroupButton …>}` (G-04-1).
- Traceability for PDF-01, OFFL-01, AUDT-01 points at Phase 5.

## Task Commits

1. **Task 1 RED: applyTheme html+body paint tests** - `6aba544` (test)
2. **Task 1 GREEN: boot canvas + splash hold** - `edeaa36` (feat)
3. **Task 2: invoiceLabel picker + Combobox unnest** - `2a0e1aa` (fix)
4. **Task 3: Phase 5 traceability** - `dee691f` (docs)

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `apps/desktop/index.html` - Boot IIFE D-02 hex, html+body paint, injected `html,body` CSS
- `apps/desktop/src/lib/theme.ts` - `applyTheme` mirrors boot paint
- `apps/desktop/src/lib/theme.test.ts` - light/dark/system html+body assertions
- `apps/desktop/src/components/splash.tsx` - Inline wordmark + ring; reduced-motion skips spin
- `apps/desktop/src/App.tsx` - `SPLASH_HOLD_MS` / `minSplashDone` (folded from dirty tree)
- `packages/ui/src/components/combobox.tsx` - Clear is a single native control
- `apps/desktop/src/routes/rechnung.tsx` - `invoiceLabel` + id-valued Select (plus overlapping header restyle from dirty tree)
- `.planning/REQUIREMENTS.md` - PDF-01 OFFL-01 AUDT-01 Phase 5

## Decisions Made

- Keep PREFS / three-value `clared-theme` guard; unknown still `system` (T-04-01).
- Do not put splash.png behind the wordmark (D-16 type-only).
- Do not add Darstellung to SessionChip (D-07). IA stays five NAV_ITEMS (D-11/D-13).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Head script cannot set `document.body` before parse**
- **Found during:** Task 1 GREEN
- **Issue:** IIFE lives in `<head>`; `document.body` is null on first run, so body would stay UA white until React.
- **Fix:** Inject `#clared-boot-paint` `html,body{background;color-scheme}` immediately; set `body.style` when body exists / on `DOMContentLoaded`. Hex still comes from the dark boolean, not from `innerHTML` of stored pref (T-04-08).
- **Files modified:** `apps/desktop/index.html`
- **Verification:** python gate `document.body` / `body.style`; vitest `applyTheme` still paints body in jsdom
- **Committed in:** `edeaa36`

**2. [Rule 1 - Bug] jsdom serializes `background` as rgb()**
- **Found during:** Task 1 GREEN
- **Issue:** Assertions on `#111110` / `#F7F7F5` failed with `rgb(17, 17, 16)` / `rgb(247, 247, 245)`.
- **Fix:** Tests accept hex or rgb serialization; implementation still writes D-02 hex.
- **Files modified:** `apps/desktop/src/lib/theme.test.ts`
- **Verification:** 11/11 theme tests pass
- **Committed in:** `edeaa36`

---

**Total deviations:** 2 auto-fixed (2 Rule 1)
**Impact on plan:** Needed for first-paint correctness and a green test in jsdom. No scope creep. Dirty-tree `rechnung.tsx` restyle folded into Task 2 because it could not be split from the picker file.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Human re-test 04-UAT 1–3 (cold launch Dark/Light, picker label, no nested Combobox buttons).
- Phase 5 owns PDF generation, offline sync, and `audit_logs`.
- Unrelated dirty files (login-gate, empty-state, globals, `.cursor/rules`) left uncommitted on purpose.

## Self-Check: PASSED

## TDD Gate Compliance

- RED: `6aba544` `test(04-04): add failing test for applyTheme html+body paint`
- GREEN: `edeaa36` `feat(04-04): paint oatmeal/charcoal boot canvas and hold Clared splash`

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*
