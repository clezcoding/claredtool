---
phase: 03-entities-invoices-live-tax
plan: 05
subsystem: api
tags: [nestjs, prisma, react, vitest, autosave, tax-evaluate]

requires:
  - phase: 03-02
    provides: Prisma invoice models, POST /api/invoices, tax-engine evaluate
  - phase: 03-06
    provides: Desktop route wiring, session-aware shell
  - phase: 03-03
    provides: Entity/customer combobox patterns
provides:
  - GET /api/invoices list and PATCH /api/invoices/:id
  - Rechnung 600ms autosave, header picker, D-17 landing, first-run empty
  - Shared live tax on rail and /tax via tax-live-store
affects: [phase-04-pdf, verify-work]

actuals:
  tokens: 78000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "600ms shared debounce for autosave + tax evaluate"
    - "tax-live-store snapshot for useSyncExternalStore"
    - "PATCH item replace via deleteMany + createMany transaction"

key-files:
  created:
    - apps/backend/src/invoices/dto/update-invoice.dto.ts
    - apps/backend/prisma/migrations/20260822180000_invoice_dates/migration.sql
    - apps/desktop/src/data/tax-live-store.ts
  modified:
    - apps/backend/src/invoices/invoices.controller.ts
    - apps/backend/src/invoices/invoices.service.ts
    - apps/backend/test/invoices.e2e-spec.ts
    - apps/desktop/src/routes/rechnung.tsx
    - apps/desktop/src/routes/tax.tsx
    - apps/desktop/src/__tests__/phase03-autosave.test.tsx
    - apps/desktop/src/__tests__/phase03-tax-rail.test.tsx
    - apps/desktop/src/__tests__/invoice.test.tsx

key-decisions:
  - "Speichert… shown during 600ms debounce window, not only during network"
  - "tax-live-store returns stable snapshot object for useSyncExternalStore"
  - "date/dueDate added to Invoice schema to match PATCH whitelist"

patterns-established:
  - "Invoice PATCH: whitelist DTO, transaction item replace, number immutable"
  - "Landing: GET /api/invoices updatedAt desc; zero rows = first-run hero"

requirements-completed: [INV-01, TAX-01]

coverage:
  - id: D1
    description: "GET /api/invoices and PATCH /api/invoices/:id with stable item order"
    requirement: INV-01
    verification:
      - kind: e2e
        ref: "pnpm --filter ./apps/backend test:e2e -- invoices"
        status: unknown
    human_judgment: true
    rationale: "E2e requires local Postgres; not reachable in executor environment"
  - id: D2
    description: "Rechnung 600ms autosave, header picker, D-17 landing, first-run empty"
    requirement: INV-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/phase03-autosave.test.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Live tax rail and /tax nine fields with last-good on evaluate failure"
    requirement: TAX-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/phase03-tax-rail.test.tsx"
        status: pass
    human_judgment: false

duration: 24min
completed: 2026-08-22
status: complete
---

# Phase 03 Plan 05: Invoice Canvas & Live Tax Summary

**PATCH/list invoice APIs plus 600ms autosave, header picker, D-17 landing, and server-driven live tax on rail and /tax**

## Performance

- **Duration:** 24min
- **Started:** 2026-08-22T16:13:00Z
- **Completed:** 2026-08-22T16:37:00Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- `GET /api/invoices` (updatedAt desc) and `PATCH /api/invoices/:id` with whitelisted fields, transactional item replace, and accountant/viewer RBAC e2e cases
- Rechnung: 600ms autosave (POST then PATCH), header Combobox picker, first-run empty hero, last-edited landing, customer/entity/currency fields
- Shared `tax-live-store` feeds TaxRail four keys and `/tax` nine fields; evaluate failure keeps last-good values
- Rewrote invoice/demo/auth-gate/routes/screens tests; unskipped phase03-autosave and phase03-tax-rail

## Task Commits

1. **Task 1: PATCH invoice, GET list, stable item order** - `3504783` (feat)
2. **Task 2: Rechnung autosave, header picker, D-17 landing** - `e95958b` (feat)
3. **Task 3: Live tax debounce, last-good rail, /tax, desktop tests** - `dca6f78` (feat)

## Decisions Made

- Show `Speichert…` during the 600ms debounce pause (UI-spec in-flight copy), not only during fetch
- `tax-live-store` keeps a stable snapshot reference so `useSyncExternalStore` does not loop
- Added `date`/`dueDate` columns because PATCH whitelist included them but schema did not

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added invoice date/dueDate migration**
- **Found during:** Task 1
- **Issue:** Plan PATCH whitelist included `date`/`dueDate` but Prisma schema had no columns
- **Fix:** Migration `20260822180000_invoice_dates` + optional fields on `Invoice`
- **Files modified:** `apps/backend/prisma/schema.prisma`, migration SQL, `UpdateInvoiceDto`
- **Committed in:** `3504783`

**2. [Rule 1 - Bug] Fixed useSyncExternalStore infinite re-render on /tax**
- **Found during:** Task 3
- **Issue:** `getTaxLiveState()` returned new object each call
- **Fix:** Stable `snapshot` updated only in `setTaxLiveState`
- **Files modified:** `apps/desktop/src/data/tax-live-store.ts`
- **Committed in:** `dca6f78`

**3. [Rule 1 - Bug] Fixed autosave debounce infinite loop**
- **Found during:** Task 2
- **Issue:** `persistDraft`/`evaluateDraft` in effect deps retriggered every render
- **Fix:** Ref-based callbacks; deps limited to draft field values
- **Files modified:** `apps/desktop/src/routes/rechnung.tsx`
- **Committed in:** `e95958b`

**4. [Rule 3 - Blocking] Updated Phase 1/2 desktop tests for D-17 landing**
- **Found during:** Task 3
- **Issue:** auth-gate/routes expected sample invoice `RE-2026-001` on boot
- **Fix:** Default fetch mocks return empty invoices; assert first-run empty heading
- **Files modified:** `auth-test-doubles.ts`, `auth-gate.test.tsx`, `routes.test.tsx`
- **Committed in:** `dca6f78`

---

**Total deviations:** 4 auto-fixed (2 bugs, 1 missing critical, 1 blocking)
**Impact on plan:** All required for correctness and green desktop suite. No scope creep.

## Issues Encountered

- Backend e2e (`pnpm --filter ./apps/backend test:e2e -- invoices`) could not run: Postgres unreachable in executor environment (remote Coolify host timeout). Prisma client regenerated; tests written per plan.

## User Setup Required

None.

## Desktop Test Status

`pnpm --filter ./apps/desktop test` — **43/43 passed**

## Next Phase Readiness

- INV-01 and TAX-01 two-minute draft loop complete without PDF
- Phase 4 can consume persisted drafts and live tax decisions for PDF/audit

## Self-Check: PASSED

- `apps/backend/src/invoices/dto/update-invoice.dto.ts` — FOUND
- `apps/desktop/src/data/tax-live-store.ts` — FOUND
- `3504783`, `e95958b`, `dca6f78` — FOUND

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
