---
phase: 01-tauri-desktop-mockup-first-ui
plan: 05
subsystem: ui
tags: [react, tailwind, vitest, demo-states]

requires:
  - phase: 01-02
    provides: TaxRail, line-item cards, invoice form structure
provides:
  - Skeleton, Spinner, ErrorState demo surface primitives
  - Demo-state machine (ready/loading/error) in Rechnung screen
  - Local-state switcher for demo surfaces
  - Vitest checks for demo loading/error surfaces
affects: [phase verification, UI refinement phases]

actuals:
  tokens: 2161
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns: [local demo-state machine, TDD RED/GREEN/REFACTOR cycle]

key-files:
  created:
    - apps/desktop/src/components/skeleton.tsx
    - apps/desktop/src/components/spinner.tsx
    - apps/desktop/src/components/error-state.tsx
    - apps/desktop/src/__tests__/demo-states.test.tsx
  modified:
    - apps/desktop/src/routes/rechnung.tsx

key-decisions:
  - "Demo switcher duplicated in loading/ready branches (intentional - different header layouts)"
  - "TaxRail hidden during loading/error states (UI-SPEC UI-Considerations)"

patterns-established:
  - "Demo surfaces use local React state only - no network, no persist"
  - "Loading surface: skeleton blocks + spinner, hides real cards"
  - "Error surface: exact UI-SPEC copy with retry back to ready"

requirements-completed: [UI-01]

coverage:
  - id: D1
    description: "Skeleton, Spinner, ErrorState components as reusable primitives"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "demo-states.test.tsx#loading demo shows skeleton + spinner"
        status: pass
      - kind: integration
        ref: "tsc --noEmit exits 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Demo-state machine in Rechnung with loading/error/ready branches"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "demo-states.test.tsx#loading demo shows skeleton + spinner and hides line-item cards"
        status: pass
      - kind: unit
        ref: "demo-states.test.tsx#error demo shows exact copy and retry restores cards"
        status: pass
    human_judgment: false
  - id: D3
    description: "Demo loading surface follows UI-SPEC (skeleton on form/lists/media, spinner on CTA)"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "demo-states.test.tsx#loading demo shows skeleton + spinner"
        status: pass
    human_judgment: true
    rationale: "Visual layout (skeleton placement, spinner positioning) requires human eye - test only verifies presence, not layout quality"

duration: 5min
completed: 2026-08-19
status: complete
---

# Phase 01 Plan 05: Demo Loading/Error Surfaces Summary

**Local-state demo loading (skeleton + spinner) and error (exact UI-SPEC copy + retry) surfaces on Rechnung screen, covered by Vitest checks**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-19T15:24:00Z
- **Completed:** 2026-08-19T15:29:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Three reusable demo surface primitives (Skeleton, Spinner, ErrorState) matching UI-SPEC copywriting
- Demo-state machine (ready/loading/error) wired into Rechnung screen with local useState switcher
- Loading surface: skeleton blocks on form/lists/media + spinner on CTA, hides line-item cards
- Error surface: exact „Ein Fehler ist aufgetreten..." copy with retry callback back to ready
- Vitest checks fail if either demo surface is missing (gap closure verification)

## Task Commits

Each task was committed atomically following TDD RED/GREEN/REFACTOR:

1. **Task 1: Demo surface primitives** - `e323aac` (feat)
2. **Task 2 RED: Failing test** - `33b5e7a` (test)
3. **Task 2 GREEN: Implementation** - `324a85b` (feat)

_Note: Task 2 followed TDD cycle (RED: failing test, GREEN: passing implementation)_

## Files Created/Modified
- `apps/desktop/src/components/skeleton.tsx` - Muted pulsing block with className prop, data-testid
- `apps/desktop/src/components/spinner.tsx` - Rotating indicator with role=status, accessible label „Wird geladen"
- `apps/desktop/src/components/error-state.tsx` - Exact UI-SPEC error copy „Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support." with retry button
- `apps/desktop/src/routes/rechnung.tsx` - Demo-state machine with switcher, loading/error/ready branches, TaxRail hidden during loading/error
- `apps/desktop/src/__tests__/demo-states.test.tsx` - Vitest checks for demo loading (skeleton+spinner, no cards) and error (exact copy, retry restores cards)

## Decisions Made

- Demo switcher buttons are duplicated in loading and ready branches (intentional - loading branch shows spinner in header next to switcher, ready branch does not)
- TaxRail hidden during loading/error states per UI-SPEC UI-Considerations (only visible during ready state)

## Deviations from Plan

None - plan executed exactly as written. TDD RED/GREEN cycle followed for Task 2 as specified.

## Issues Encountered

None. All tests passed first try after GREEN implementation.

## Known Stubs

None. All demo surfaces are fully functional with exact UI-SPEC copywriting and working state transitions.

## Threat Surface Scan

No new security-relevant surface introduced. Demo switcher and state machine are local React state only - no network, no persist, no eval. Matches threat register T-01-07 (accept: local state flip only), T-01-08 (mitigate: fixed UI-SPEC error string), T-01-09 (accept: pure render branch).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

UI-01 truth #16 („Loading/error are demo surfaces...") is now verifiable in code. Phase 1 gap closed - ready for phase verification.

## Self-Check: PASSED

Files created:
- ✓ apps/desktop/src/components/skeleton.tsx
- ✓ apps/desktop/src/components/spinner.tsx
- ✓ apps/desktop/src/components/error-state.tsx
- ✓ apps/desktop/src/__tests__/demo-states.test.tsx

Files modified:
- ✓ apps/desktop/src/routes/rechnung.tsx

Commits exist:
- ✓ e323aac
- ✓ 33b5e7a
- ✓ 324a85b

All tests pass:
- ✓ 20 tests passed across 4 test files

---
*Phase: 01-tauri-desktop-mockup-first-ui*
*Completed: 2026-08-19*
