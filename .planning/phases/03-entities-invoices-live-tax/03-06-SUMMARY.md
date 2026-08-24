---
phase: 03-entities-invoices-live-tax
plan: 06
subsystem: ui
tags: [desktop, bearer, shadcn, tax-rail, entities, invoices, apiFetch]

requires:
  - phase: 03-entities-invoices-live-tax
    plan: 02
    provides: Nest product APIs, PermissionsGuard, POST /api/tax/evaluate
provides:
  - setSessionToken / Bearer apiFetch for product routes
  - shadcn Input, Label, Select, Combobox on @clared/ui
  - Owner tracer Entities create panel + Rechnung draft POST + live TaxRail
affects: [03-03, 03-05]

actuals:
  tokens: 42000
  tasks: 2
  commits: 1

tech-stack:
  added: ["@base-ui/react (via shadcn combobox)", "shadcn input/label/select/combobox in packages/ui"]
  patterns:
    - "setSessionToken module-level mirror of setOnUnauthorized (D-10)"
    - "TaxRail props: last-good decision + 422 error keep (D-11)"
    - "Tracer one-shot persist when line item valid (03-05 adds 600ms autosave)"

key-files:
  created:
    - packages/ui/src/components/input.tsx
    - packages/ui/src/components/label.tsx
    - packages/ui/src/components/select.tsx
    - packages/ui/src/components/combobox.tsx
  modified:
    - apps/desktop/src/auth/api.ts
    - apps/desktop/src/auth/session-provider.tsx
    - apps/desktop/src/routes/entities.tsx
    - apps/desktop/src/routes/rechnung.tsx
    - apps/desktop/src/components/tax-rail.tsx
    - packages/ui/src/index.ts

key-decisions:
  - "Button absorbs variant/size/asChild props only — no CVA variant API (UI-SPEC)"
  - "Tracer persist fires once when entity + filled line item; customer POST inline for DE B2B evaluate path"
  - "First-run hero kept; sample invoice removed from signed-in landing (D-17 stub)"

patterns-established:
  - "Product calls use apiFetch only; evaluate invoice-shaped body never @clared/tax-engine"

requirements-completed: [ENT-01, INV-01, TAX-01]

coverage:
  - id: D1
    description: apiFetch sends Bearer via setSessionToken from applySession/logout
    requirement: ENT-01
    verification:
      - kind: other
        ref: "grep setSessionToken apps/desktop/src/auth/api.ts; tsc --noEmit"
        status: pass
    human_judgment: false
  - id: D2
    description: Owner Entities Anlegen POST /api/entities in list+panel slot
    requirement: ENT-01
    verification:
      - kind: other
        ref: "apps/desktop/src/routes/entities.tsx POST /api/entities"
        status: pass
    human_judgment: true
    rationale: Tracer UI wired; live owner path needs running backend + Authentik session
  - id: D3
    description: Rechnung POST draft + TaxRail four canonical dt keys from /api/tax/evaluate
    requirement: INV-01
    verification:
      - kind: other
        ref: "apps/desktop/src/routes/rechnung.tsx + tax-rail.tsx"
        status: pass
    human_judgment: true
    rationale: Evaluate + persist need live Nest + DB; desktop tsc only in this plan
  - id: D4
    description: Desktop does not import @clared/tax-engine
    requirement: TAX-01
    verification:
      - kind: other
        ref: "grep -R @clared/tax-engine apps/desktop (0 matches)"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 06: Desktop Tracer Summary

**Bearer product fetch, shadcn form primitives, and one-path Entities/Rechnung/TaxRail wired to live Nest APIs**

## Performance

- **Duration:** 18 min
- **Tasks:** 2 (task 2 verify-only, no second commit)
- **Commits:** 1

## Accomplishments

- `setSessionToken` attaches `Authorization: Bearer` in `apiFetch`; `SessionProvider` sets on `applySession`, clears on logout/401
- shadcn `input`, `label`, `select`, `combobox` added to `@clared/ui` and exported
- Entities: enabled Anlegen when `entity.create`; create form in detail Card slot; POST `/api/entities`
- Rechnung: empty first-run form + hero; entity Select; auto POST customer + draft invoice; TaxRail from POST `/api/tax/evaluate`
- TaxRail: four dt keys; 422 keeps last good or em dash; PDF peek unchanged
- Demo Bereit/Laden/Fehler buttons removed

## Task Commits

1. **Tracer: Bearer + Entities/Rechnung/TaxRail** — `cb22b10` (feat)
2. **Task 2: No @clared/tax-engine in desktop** — verify-only (grep 0 matches); no file changes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn combobox tsc failed on Button variant/asChild**
- **Found during:** Task 1 verify (`tsc --noEmit`)
- **Issue:** `InputGroupButton` / combobox pass `variant`, `size`, `asChild` to Button without CVA API
- **Fix:** Button destructures and drops those props (no new CVA variants per UI-SPEC)
- **Files modified:** `packages/ui/src/components/button.tsx`
- **Committed in:** cb22b10

---

**Total deviations:** 1 auto-fixed (blocking tsc)
**Impact on plan:** No scope change.

## Issues Encountered

- Existing Vitest suites (`invoice.test.tsx`, `screens.test.tsx`, `demo-states.test.tsx`, `auth-gate.test.tsx`) still assume Phase 1 sample/mock landing; not updated in this plan (verify was tsc-only). 03-05 should refresh desktop tests.

## User Setup Required

Backend + Postgres from 03-02; desktop `VITE_BACKEND_URL` pointing at Nest. Owner session with `entity.create`, `invoice.write`, `tax.evaluate`.

## Next Phase Readiness

- 03-03: country/legal-form catalog Comboboxes on Entities
- 03-05: 600ms autosave, invoice picker, last-edited landing

## Self-Check: PASSED

- FOUND: apps/desktop/src/auth/api.ts (setSessionToken)
- FOUND: packages/ui/src/components/combobox.tsx
- FOUND: apps/desktop/src/routes/entities.tsx
- FOUND: apps/desktop/src/routes/rechnung.tsx
- FOUND: apps/desktop/src/components/tax-rail.tsx
- FOUND: commit cb22b10

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
