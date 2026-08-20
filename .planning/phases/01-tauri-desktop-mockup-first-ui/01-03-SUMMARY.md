---
phase: 01-tauri-desktop-mockup-first-ui
plan: 03
subsystem: ui
tags: [react, hash-router, vitest, entities, kunden, tax-decision, disabled-create]

requires:
  - phase: 01-tauri-desktop-mockup-first-ui
    provides: HashRouter AppShell, SAMPLE_INVOICE seller/buyer/taxDecision, @clared/ui Card
provides:
  - Entities one-row EU-GmbH list + read-only fake detail
  - Kunden one-row US customer list + read-only fake detail
  - Visible-disabled Anlegen with Phase-3 hint
  - /tax staged canonical TaxDecision view
affects: [01-04-higgsfield-windows-ci, phase-3-entities]

actuals:
  tokens: 3134
  tasks: 3
  commits: 5

tech-stack:
  added:
    - "@clared/ui Button"
  patterns:
    - List + local selectedId read-only detail (not split inspector)
    - Visible-disabled Anlegen mock with verbatim Phase-3 hint
    - Tax screen labels are canonical TaxDecision field names

key-files:
  created:
    - apps/desktop/src/routes/entities.tsx
    - apps/desktop/src/routes/kunden.tsx
    - apps/desktop/src/routes/tax.tsx
    - apps/desktop/src/components/create-disabled-button.tsx
    - apps/desktop/src/__tests__/screens.test.tsx
    - packages/ui/src/components/button.tsx
  modified:
    - apps/desktop/src/App.tsx
    - packages/ui/src/index.ts

key-decisions:
  - "Added a minimal @clared/ui Button so CreateDisabledButton matches the plan; Rechnung still uses native buttons"
  - "Entity/Kunden detail is a panel below the list after click, not a permanent split inspector (D-29)"
  - "/tax shows all nine StagedTaxDecision fields; the invoice rail still shows four"

patterns-established:
  - "Pattern 8: Entities/Kunden are one SAMPLE_INVOICE party row; click sets local selectedId; no persist"
  - "Pattern 9: Anlegen is visible, disabled, hinted — never omitted, never a fake create form"
  - "Pattern 10: /tax is the same staged TaxDecision as the invoice rail, canonical names only"

requirements-completed: [UI-01]

coverage:
  - id: D1
    description: "Entities: one EU-GmbH row from SAMPLE_INVOICE.seller; click opens read-only detail; Anlegen visible and disabled with Phase-3 hint"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/screens.test.tsx#entities screen"
        status: pass
    human_judgment: false
  - id: D2
    description: "Kunden: one US customer row from SAMPLE_INVOICE.buyer; click opens read-only detail; shared disabled Anlegen"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/screens.test.tsx#kunden screen"
        status: pass
    human_judgment: false
  - id: D3
    description: "/tax renders staged SAMPLE_INVOICE.taxDecision with canonical field names (legal_reference, applied_rule_id, no RESEARCH aliases)"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/screens.test.tsx#tax screen staged TaxDecision canonical fields"
        status: pass
    human_judgment: false

duration: 14min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 03: Entities, Kunden, and Tax Screens Summary

**Five-screen shell complete: Entities and Kunden are one-row SAMPLE_INVOICE lists with read-only click detail and a visible-disabled Anlegen; /tax shows the staged canonical TaxDecision**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-19T13:44:32Z
- **Completed:** 2026-08-19T13:58:06Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Entities lists Nordlicht GmbH (SAMPLE_INVOICE.seller); click shows read-only Name / Adresse / USt-IdNr.
- Kunden lists Acme Manufacturing LLC (SAMPLE_INVOICE.buyer); click shows read-only Name / Adresse / Land
- Shared `CreateDisabledButton`: visible disabled „Anlegen“ plus hint „Wird in Phase 3 aktiviert“
- `/tax` renders all nine `StagedTaxDecision` fields from SAMPLE_INVOICE (same staged decision as the invoice rail)

## Task Commits

Each task was committed atomically:

1. **Task 1: Entities screen** - `e0ea72b` (test RED), `0dda6ef` (feat GREEN)
2. **Task 2: Kunden screen** - `66c2383` (test RED), `5303e0f` (feat GREEN)
3. **Task 3: Tax screen** - `e61c392` (feat)

**Plan metadata:** docs close-out commit with STATE.md, ROADMAP.md, REQUIREMENTS.md

## TDD Gate Compliance

- Task 1 RED: `e0ea72b` `test(01-03): add failing test for Entities list, detail, and disabled Anlegen`
- Task 1 GREEN: `0dda6ef` `feat(01-03): implement Entities list, read-only detail, and disabled Anlegen`
- Task 2 RED: `66c2383` `test(01-03): add failing test for Kunden list, detail, and disabled Anlegen`
- Task 2 GREEN: `5303e0f` `feat(01-03): implement Kunden list, read-only detail, and disabled Anlegen`
- Task 3: not `tdd="true"` — single feat commit
- REFACTOR: none

## Files Created/Modified

- `apps/desktop/src/routes/entities.tsx` - one seller row, local selectedId, read-only detail
- `apps/desktop/src/routes/kunden.tsx` - one buyer row, local selectedId, read-only detail
- `apps/desktop/src/routes/tax.tsx` - staged canonical TaxDecision definition list
- `apps/desktop/src/components/create-disabled-button.tsx` - disabled Anlegen + Phase-3 hint
- `apps/desktop/src/App.tsx` - HashRouter children for Entities/Kunden/Tax; PlaceholderScreen removed
- `apps/desktop/src/__tests__/screens.test.tsx` - entities, kunden, tax assertions
- `packages/ui/src/components/button.tsx` - minimal @clared/ui Button
- `packages/ui/src/index.ts` - export Button

## Decisions Made

- `@clared/ui` had no Button; added a thin primitive rather than a native-only Anlegen (plan named `@clared/ui Button`)
- Detail is below the list after click, not a always-on split inspector (D-29)
- Tax screen enumerates all nine `StagedTaxDecision` keys; invoice rail stays at four fields from 01-02
- No persist, no owner-only create path, no `evaluate()` — hardcoded SAMPLE_INVOICE only (D-13, D-31)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing @clared/ui Button**
- **Found during:** Task 1 GREEN
- **Issue:** Plan required a visible disabled `@clared/ui` Button; package only exported Card
- **Fix:** Added `packages/ui/src/components/button.tsx` and exported it
- **Files modified:** `packages/ui/src/components/button.tsx`, `packages/ui/src/index.ts`
- **Verification:** Anlegen is a disabled button; screens.test.tsx exits 0
- **Committed in:** `0dda6ef` (Task 1 GREEN)

**2. [Rule 3 - Blocking] Wire screens into HashRouter**
- **Found during:** Task 1 GREEN
- **Issue:** Plan `files_modified` omitted `App.tsx`; PlaceholderScreen would hide the new routes
- **Fix:** Register `EntitiesScreen` / `KundenScreen` / `TaxScreen`; drop unused `PlaceholderScreen`
- **Files modified:** `apps/desktop/src/App.tsx`
- **Verification:** `routes.test.tsx` and `screens.test.tsx` exit 0
- **Committed in:** `0dda6ef`, `5303e0f`, `e61c392`

**3. [Rule 3 - Blocking] Vitest file filter under `pnpm --filter ./apps/desktop exec`**
- **Found during:** Task 1 RED verify
- **Issue:** Plan command passed `apps/desktop/src/__tests__/screens.test.tsx`; filter cwd is already `apps/desktop`
- **Fix:** Run `src/__tests__/screens.test.tsx` relative to the package (no code change)
- **Files modified:** none
- **Verification:** vitest discovers and runs the file
- **Committed in:** n/a (command-path only)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** Screens reachable; Anlegen uses the named UI primitive; verify path matches 01-02. No scope creep. 01-04 untouched.

## Issues Encountered

- None beyond the three auto-fixes above

## Known Stubs

None that block this plan. Disabled „Anlegen“ is the D-31 mock (Phase 3 activates create). Carried from 01-02:

| File | Stub | Resolves in |
|------|------|-------------|
| `apps/desktop/public/empty-state-hero.png` | 1×1 PNG referenced by empty state | 01-04 |

UI-SPEC loading/error demo surfaces still not built (no network in Phase 1).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for **01-04-PLAN.md** (Higgsfield empty-state hero + windows-latest CI)
- Do not start 01-04 from this executor
- Five sidebar destinations are real screens; visual density of list/detail remains phase-level human verify

## Self-Check: PASSED

- FOUND: `apps/desktop/src/routes/entities.tsx`
- FOUND: `apps/desktop/src/routes/kunden.tsx`
- FOUND: `apps/desktop/src/routes/tax.tsx`
- FOUND: `apps/desktop/src/components/create-disabled-button.tsx`
- FOUND: `apps/desktop/src/__tests__/screens.test.tsx`
- FOUND: `e0ea72b` `0dda6ef` `66c2383` `5303e0f` `e61c392`

---
*Phase: 01-tauri-desktop-mockup-first-ui*
*Completed: 2026-08-19*
