---
phase: 03-entities-invoices-live-tax
plan: 01
subsystem: testing
tags: [jest, vitest, nyquist, tax-engine, nestjs, e2e, wave-0]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: AUTH_TEST_MODE e2e bootstrap, RBAC catalog, desktop auth fixtures
provides:
  - Skip-wrapped backend e2e specs for entities, invoices, tax evaluate
  - PermissionsGuard contract unit spec
  - @clared/tax-engine CJS package with RED evaluate.spec.ts (23 matrix ids)
  - Skip-wrapped desktop phase03 Vitest specs
  - signedInOwner product permission catalog strings
affects: [03-02, 03-03, 03-04, 03-05]

actuals:
  tokens: 32000
  tasks: 2
  commits: 3

tech-stack:
  added: ["@clared/tax-engine workspace package (Jest, no ajv yet)"]
  patterns:
    - "describe.skip('phase03-product') as unsip signal for later plans"
    - "Wave 0 RED specs before production handlers"

key-files:
  created:
    - apps/backend/test/entities.e2e-spec.ts
    - apps/backend/test/invoices.e2e-spec.ts
    - apps/backend/test/tax.e2e-spec.ts
    - apps/backend/src/auth/permissions.guard.spec.ts
    - packages/tax-engine/package.json
    - packages/tax-engine/src/evaluate.spec.ts
    - apps/desktop/src/__tests__/phase03-entities.test.tsx
    - apps/desktop/src/__tests__/phase03-tax-rail.test.tsx
    - apps/desktop/src/__tests__/phase03-autosave.test.tsx
  modified:
    - apps/desktop/src/__tests__/auth-signed-in.ts
    - pnpm-lock.yaml

key-decisions:
  - "PermissionsGuard spec uses inline contract class until 03-02 adds real guard files"
  - "tax-engine has no src/index.ts export this plan — Jest fails on missing module (RED)"

patterns-established:
  - "describe.skip('phase03-product') wraps all new product backend and desktop specs"
  - "evaluate.spec.ts lists all 23 docs/clared-tax-rule-matrix.md ids plus 0/2-match throw cases"

requirements-completed: [ENT-01, INV-01, TAX-01, TAX-02]

coverage:
  - id: D1
    description: Backend entities e2e spec (owner 201, viewer 403, unauth 401)
    requirement: ENT-01
    verification:
      - kind: e2e
        ref: apps/backend/test/entities.e2e-spec.ts (describe.skip)
        status: pass
    human_judgment: true
    rationale: Specs skipped until 03-02 implements routes; assertions not executed yet
  - id: D2
    description: Backend invoices e2e spec (POST items, GET by id, empty items 201)
    requirement: INV-01
    verification:
      - kind: e2e
        ref: apps/backend/test/invoices.e2e-spec.ts (describe.skip)
        status: pass
    human_judgment: true
    rationale: Skipped Wave 0 — green CI defers to 03-02 unsip
  - id: D3
    description: Backend tax evaluate e2e spec (invoice-shaped body, 422 on no match)
    requirement: TAX-01
    verification:
      - kind: e2e
        ref: apps/backend/test/tax.e2e-spec.ts (describe.skip)
        status: pass
    human_judgment: true
    rationale: Skipped Wave 0
  - id: D4
    description: PermissionsGuard contract unit spec
    requirement: ENT-01
    verification:
      - kind: unit
        ref: apps/backend/src/auth/permissions.guard.spec.ts (describe.skip)
        status: pass
    human_judgment: true
    rationale: Inline contract only; real guard in 03-02
  - id: D5
    description: tax-engine evaluate RED spec (23 matrix ids, 0/2-match throws)
    requirement: TAX-02
    verification:
      - kind: unit
        ref: packages/tax-engine/src/evaluate.spec.ts
        status: fail
    human_judgment: false
  - id: D6
    description: Desktop phase03 entities/tax-rail/autosave skip-wrapped specs
    requirement: ENT-01
    verification:
      - kind: automated_ui
        ref: apps/desktop/src/__tests__/phase03-*.test.tsx (describe.skip)
        status: pass
    human_judgment: true
    rationale: Desktop specs skipped; unsip in 03-03 and 03-05
  - id: D7
    description: signedInOwner carries entity.create and product write/evaluate permissions
    requirement: ENT-01
    verification:
      - kind: unit
        ref: apps/desktop/src/__tests__/auth-signed-in.ts
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 01: Nyquist Wave 0 Summary

**Skip-wrapped Nest e2e + desktop Vitest specs and RED @clared/tax-engine evaluate scaffold before production handlers**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-22T15:38:00Z
- **Completed:** 2026-08-22T15:44:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Backend product e2e specs for entities, invoices, and tax evaluate — all wrapped in `describe.skip('phase03-product')` so CI stays green
- PermissionsGuard contract unit spec documents metadata skip and 403 when permission missing
- `@clared/tax-engine` workspace package (CJS, no `type: module`) with RED `evaluate.spec.ts` listing all 23 matrix rule ids
- Desktop Wave 0 specs for disabled Anlegen RBAC hint, tax-rail keep-last-good, and autosave status copy
- `signedInOwner.permissions` filled with `entity.create`, `kunde.write`, `invoice.write`, `invoice.read`, `tax.evaluate`

## Task Commits

1. **Task 1: Skip-wrapped Nest e2e + PermissionsGuard RED specs** - `62ce395` (test)
2. **Task 2: Scaffold @clared/tax-engine RED spec + desktop skip-wrapped UI specs** - `9c41076` (test)

**Plan metadata:** pending (this commit)

## Files Created/Modified

- `apps/backend/test/entities.e2e-spec.ts` - ENT-01 owner 201 / viewer 403 / unauth 401
- `apps/backend/test/invoices.e2e-spec.ts` - INV-01 POST+GET items, empty items 201
- `apps/backend/test/tax.e2e-spec.ts` - TAX-01 invoice-shaped evaluate, 422 unclassified
- `apps/backend/src/auth/permissions.guard.spec.ts` - Guard contract (inline until 03-02)
- `packages/tax-engine/` - CJS package scaffold + RED evaluate spec
- `apps/desktop/src/__tests__/phase03-*.test.tsx` - Skipped UI contract specs
- `apps/desktop/src/__tests__/auth-signed-in.ts` - Owner product permissions

## Decisions Made

- PermissionsGuard spec uses an inline contract class so the file compiles before `permissions.guard.ts` exists in 03-02
- No `src/index.ts` in tax-engine this plan — import failure is the intentional RED gate

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 03-02 can unsip backend e2e + guard spec and implement handlers to turn specs green
- 03-04 can implement `evaluate` against the 23-id spec matrix
- 03-03 / 03-05 unsip desktop phase03 specs when UI wiring lands

## Self-Check: PASSED

- FOUND: apps/backend/test/entities.e2e-spec.ts
- FOUND: apps/backend/test/invoices.e2e-spec.ts
- FOUND: apps/backend/test/tax.e2e-spec.ts
- FOUND: apps/backend/src/auth/permissions.guard.spec.ts
- FOUND: packages/tax-engine/src/evaluate.spec.ts
- FOUND: apps/desktop/src/__tests__/phase03-entities.test.tsx
- FOUND: apps/desktop/src/__tests__/phase03-tax-rail.test.tsx
- FOUND: apps/desktop/src/__tests__/phase03-autosave.test.tsx
- FOUND: commit 62ce395
- FOUND: commit 9c41076

---
*Phase: 03-entities-invoices-live-tax*
*Completed: 2026-08-22*
