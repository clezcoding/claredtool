---
phase: 03-entities-invoices-live-tax
plan: 03
subsystem: ui
tags: [entities, customers, combobox, eu-vat, legal-forms, rbac, e2e]

requires:
  - phase: 03-entities-invoices-live-tax
    plan: 02
    provides: Nest product APIs, PermissionsGuard, entity/customer POST/GET
  - phase: 03-entities-invoices-live-tax
    plan: 06
    provides: Bearer apiFetch, shadcn Combobox, tracer Entities create panel
provides:
  - eu-countries.ts / isEuCountry for EU-27 VAT rule
  - legal-forms.ts country→forms catalog (desktop + backend)
  - Writable Entities and Kunden list+panel create UX
  - Server ValidateIf VAT + legal-form pair validation
  - Green entities/customers e2e and desktop entity specs
affects: [03-05]

actuals:
  tokens: 48000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Country Combobox then legal-form Combobox; changing country clears form"
    - "CreateDisabledButton RBAC hints replace Phase-3 activation copy"
    - "Backend isValidLegalForm allowlist mirrors desktop catalog"

key-files:
  created:
    - apps/desktop/src/data/eu-countries.ts
    - apps/desktop/src/data/legal-forms.ts
    - apps/backend/src/common/eu-countries.ts
    - apps/backend/src/entities/legal-forms.ts
    - apps/backend/test/customers.e2e-spec.ts
  modified:
    - apps/backend/src/entities/dto/create-entity.dto.ts
    - apps/backend/src/customers/dto/create-customer.dto.ts
    - apps/backend/src/entities/entities.service.ts
    - apps/backend/test/entities.e2e-spec.ts
    - apps/desktop/src/routes/entities.tsx
    - apps/desktop/src/routes/kunden.tsx
    - apps/desktop/src/components/create-disabled-button.tsx
    - apps/desktop/src/__tests__/phase03-entities.test.tsx
    - apps/desktop/src/__tests__/screens.test.tsx

key-decisions:
  - "Backend legal-forms catalog inlined as TS (JSON import caused runtime 500 without resolveJsonModule)"
  - "Kunden list loads customers per entity via parallel GET /api/customers?entityId="

patterns-established:
  - "EU VAT required via shared isEuCountry set on desktop and Nest DTOs"
  - "Invalid country/legalForm pair returns HTTP 422 from EntitiesService"

requirements-completed: [ENT-01]

coverage:
  - id: D1
    description: EU-27 vatId required; non-EU optional; DE+LLC returns 422
    requirement: ENT-01
    verification:
      - kind: e2e
        ref: apps/backend/test/entities.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Customer POST requires entityId
    requirement: ENT-01
    verification:
      - kind: e2e
        ref: apps/backend/test/customers.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Entities/Kunden list+panel create with Comboboxes and RBAC Anlegen hints
    requirement: ENT-01
    verification:
      - kind: other
        ref: "pnpm --filter ./apps/desktop exec tsc --noEmit"
        status: pass
    human_judgment: true
    rationale: Combobox interaction and live POST need running backend session
  - id: D4
    description: Desktop entity specs green; Inhaber hint when entity.create missing
    requirement: ENT-01
    verification:
      - kind: unit
        ref: apps/desktop/src/__tests__/phase03-entities.test.tsx
        status: pass
    human_judgment: false

duration: 22min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 03: Entity/Customer Create UX Summary

**Country→legal-form catalogs, EU VAT ValidateIf on API, and list+panel Entities/Kunden create with RBAC Anlegen hints**

## Performance

- **Duration:** 22 min
- **Tasks:** 3
- **Commits:** 3

## Accomplishments

- `eu-countries.ts` and `legal-forms.ts` on desktop; matching backend EU set and legal-form allowlist
- Entity/customer DTOs use `ValidateIf` for EU VAT; invalid legal-form pairs return 422
- Entities screen: searchable country/legal-form Comboboxes, EU-only USt-IdNr., `hover:bg-muted`, create panel in detail slot
- Kunden screen: Entity combobox first, API-backed list/detail, same loading/error/empty patterns
- `CreateDisabledButton` shows Inhaber / kunde.write hints; Phase-3 activation copy removed
- `phase03-entities.test.tsx` unsipped; `screens.test.tsx` updated for RBAC hints

## Task Commits

1. **Task 1: Country catalog, EU VAT, legal-form pair on API** — `8c8b0df` (feat)
2. **Task 2: Entities and Kunden list+panel create UX** — `3f7f968` (feat)
3. **Task 3: Unsip desktop entity specs** — `30a43fb` (test)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Backend legal-forms.json import caused 500**
- **Found during:** Task 1 verify (entities e2e POST → 500)
- **Issue:** `import catalog from "./legal-forms.json"` without `resolveJsonModule` broke runtime
- **Fix:** Inlined catalog in `apps/backend/src/entities/legal-forms.ts`; removed JSON file
- **Files modified:** `apps/backend/src/entities/legal-forms.ts`
- **Committed in:** 8c8b0df

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** No scope change. Catalog still shared semantically with desktop TS file.

## Issues Encountered

- Product e2e needs `DATABASE_URL` pointing at compose Postgres Docker IP when host `:5432` is not the clared container (same as 03-02)
- `pnpm --filter ./apps/desktop test -- <file>` runs full suite; use `vitest run <path>` for single-file runs

## User Setup Required

OrbStack/Docker Postgres from 03-02. Desktop `VITE_BACKEND_URL` at Nest. Owner session with `entity.create` and `kunde.write` for live create.

## Next Phase Readiness

- 03-05 can wire Rechnung autosave, invoice picker, last-edited landing
- Entity/customer rows available for invoice identity card Comboboxes

## Self-Check: PASSED

- FOUND: apps/desktop/src/data/eu-countries.ts
- FOUND: apps/desktop/src/data/legal-forms.ts
- FOUND: apps/desktop/src/routes/entities.tsx
- FOUND: apps/desktop/src/routes/kunden.tsx
- FOUND: apps/backend/test/customers.e2e-spec.ts
- FOUND: commit 8c8b0df
- FOUND: commit 3f7f968
- FOUND: commit 30a43fb

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
