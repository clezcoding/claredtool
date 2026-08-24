---
phase: 03-entities-invoices-live-tax
plan: 02
subsystem: api
tags: [nestjs, prisma, tax-engine, rbac, e2e, evaluate, invoice-counter]

requires:
  - phase: 03-entities-invoices-live-tax
    plan: 01
    provides: Skip-wrapped e2e specs, RED evaluate.spec.ts scaffold
provides:
  - @clared/tax-engine evaluate with EU_INTRACOMM_B2B_SERVICE rule
  - PermissionsGuard + RequirePermission on product routes
  - Entities, Customers, Invoices, Tax controllers
  - Prisma product migration (entities through invoice_counters)
  - Green product e2e + guard unit spec; Dockerfile builds tax-engine
affects: [03-03, 03-04, 03-05, 03-06]

actuals:
  tokens: 52000
  tasks: 3
  commits: 3

tech-stack:
  added: [ajv@8.20.0, ajv-formats@3.0.1, @clared/tax-engine workspace dep on backend]
  patterns:
    - "Invoice counter INSERT ON CONFLICT DO UPDATE RETURNING inside $transaction"
    - "facts-mapper invoice-shaped DTO to TransactionFacts (D-18)"
    - "RuleSeed OnModuleInit files SSOT over tax_rules (D-14)"
    - "Product controllers registered before CatchAllController"

key-files:
  created:
    - packages/tax-engine/src/index.ts
    - packages/tax-engine/rules/EU_INTRACOMM_B2B_SERVICE.json
    - apps/backend/src/auth/permissions.guard.ts
    - apps/backend/src/entities/entities.controller.ts
    - apps/backend/src/customers/customers.controller.ts
    - apps/backend/src/invoices/invoices.controller.ts
    - apps/backend/src/tax/tax.controller.ts
    - apps/backend/src/tax/facts-mapper.ts
    - apps/backend/prisma/migrations/20260822155017_product_entities_invoices_tax/migration.sql
  modified:
    - apps/backend/prisma/schema.prisma
    - apps/backend/src/app.module.ts
    - apps/backend/src/prisma/prisma.service.ts
    - apps/backend/Dockerfile
    - apps/backend/test/entities.e2e-spec.ts
    - apps/backend/test/invoices.e2e-spec.ts
    - apps/backend/test/tax.e2e-spec.ts

key-decisions:
  - "intracomm_eu custom condition in matcher for cross-border EU without priority (D-13)"
  - "Prisma Decimal serializes as string in JSON — e2e compares with Number()"
  - "Local migrate/e2e use Docker container IP when host :5432 is a different Postgres"

patterns-established:
  - "Tagged $queryRaw for invoice_counters — never Prisma upsert on counter row"
  - "evaluate throws EvaluateError no_unique_match → HTTP 422"

requirements-completed: [ENT-01, INV-01, TAX-01, TAX-02]

coverage:
  - id: D1
    description: Owner POST entity 201; viewer 403; unauth 401
    requirement: ENT-01
    verification:
      - kind: e2e
        ref: apps/backend/test/entities.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Owner GET /api/entities and GET /api/customers?entityId= 200 arrays
    requirement: ENT-01
    verification:
      - kind: e2e
        ref: apps/backend/test/entities.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Owner POST invoice with items; GET by id; RE-{year}-{n} number
    requirement: INV-01
    verification:
      - kind: e2e
        ref: apps/backend/test/invoices.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D4
    description: Owner POST /api/tax/evaluate returns EU_INTRACOMM_B2B_SERVICE; no-match 422
    requirement: TAX-01
    verification:
      - kind: e2e
        ref: apps/backend/test/tax.e2e-spec.ts
        status: pass
    human_judgment: false
  - id: D5
    description: evaluate(facts) in @clared/tax-engine; exactly-one-match contract
    requirement: TAX-02
    verification:
      - kind: unit
        ref: packages/tax-engine/src/evaluate.spec.ts#EU_INTRACOMM_B2B_SERVICE
        status: pass
    human_judgment: false
  - id: D6
    description: PermissionsGuard metadata skip and 403 when permission absent
    requirement: ENT-01
    verification:
      - kind: unit
        ref: apps/backend/src/auth/permissions.guard.spec.ts
        status: pass
    human_judgment: false
  - id: D7
    description: Dockerfile COPY+build packages/tax-engine before nest build
    requirement: TAX-02
    verification:
      - kind: other
        ref: "grep tax-engine apps/backend/Dockerfile (3 matches)"
        status: pass
    human_judgment: true
    rationale: Image build not executed in this plan — grep confirms Dockerfile wiring only

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 02: Backend Tracer Summary

**Nest product APIs with @clared/tax-engine evaluate, Prisma product migration, and green owner tracer e2e**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T15:45:00Z
- **Completed:** 2026-08-22T15:57:00Z
- **Tasks:** 3
- **Files modified:** 35

## Accomplishments

- `@clared/tax-engine` exports `evaluate(facts)` with Ajv-validated `EU_INTRACOMM_B2B_SERVICE.json` rule (D-15, TAX-02)
- Prisma models Entity, Customer, Invoice, InvoiceItem, TaxRule, InvoiceCounter + named migration applied locally
- PermissionsGuard after AuthGuard; product controllers before CatchAllController
- Owner tracer path green: POST entity/customer/invoice, GET lists, POST evaluate → `EU_INTRACOMM_B2B_SERVICE`
- Dockerfile copies and builds tax-engine CJS before `nest build`

## Task Commits

1. **Task 1: End-to-end tracer** - `382864b` (feat)
2. **Task 2: Prisma named migration** - `63f982d` (chore)
3. **Task 3: Unsip e2e + Dockerfile** - `675f263` (test)

## Files Created/Modified

- `packages/tax-engine/` - evaluate, match, store, one rule JSON, schema copy for Ajv
- `apps/backend/src/entities|customers|invoices|tax/` - CRUD + evaluate controllers/services
- `apps/backend/src/auth/permissions.*` - RequirePermission decorator + guard
- `apps/backend/prisma/migrations/20260822155017_product_entities_invoices_tax/` - product tables
- `apps/backend/Dockerfile` - tax-engine workspace build step
- `apps/backend/test/*.e2e-spec.ts` - unsipped phase03-product suites

## Decisions Made

- `intracomm_eu` matcher flag enforces different EU member states without using priority (D-13)
- E2e DATABASE_URL default uses compose.clared.yml credentials; override with Docker IP when host :5432 conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Invoice e2e menge assertion failed on Decimal string**
- **Found during:** Task 3
- **Issue:** Prisma Decimal serializes as `"1"` not `1` in JSON
- **Fix:** `Number(fetched.body.items[1].menge)` in invoices e2e
- **Files modified:** apps/backend/test/invoices.e2e-spec.ts
- **Committed in:** 675f263

**2. [Rule 3 - Blocking] Local Postgres role mismatch on 127.0.0.1:5432**
- **Found during:** Task 2
- **Issue:** Host port 5432 is macOS Postgres, not compose.clared.yml container
- **Fix:** `prisma migrate dev` and e2e via Docker container IP `192.168.107.x`
- **Files modified:** none (runtime DATABASE_URL override)
- **Committed in:** n/a (operational)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking env)
**Impact on plan:** No scope change. CI still needs Postgres service for product e2e (pre-existing gap).

## Issues Encountered

- Host :5432 not compose Postgres — migrate/e2e require `DATABASE_URL` to Docker network IP or stop conflicting local Postgres

## User Setup Required

OrbStack/Docker: `docker compose -f compose.clared.yml up -d postgres` before migrate or product e2e. If `127.0.0.1:5432` is another Postgres, set `DATABASE_URL` to the compose container IP.

## Next Phase Readiness

- 03-03/03-06 can wire desktop Bearer + one-path UI against live APIs
- 03-04 can add remaining 22 rule JSON files against evaluate.spec matrix
- 03-05 can add invoice PATCH/collection GET + autosave

## Self-Check: PASSED

- FOUND: packages/tax-engine/src/index.ts
- FOUND: apps/backend/src/auth/permissions.guard.ts
- FOUND: apps/backend/prisma/migrations/20260822155017_product_entities_invoices_tax/migration.sql
- FOUND: commit 382864b
- FOUND: commit 63f982d
- FOUND: commit 675f263

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
