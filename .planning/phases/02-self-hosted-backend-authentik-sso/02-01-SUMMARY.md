---
phase: 02-self-hosted-backend-authentik-sso
plan: 01
subsystem: testing
tags: [nestjs, jest, vitest, rbac, health, authentik, wave-0]

requires:
  - phase: 01-tauri-desktop-mockup-first-ui
    provides: Desktop Vitest suite, routes.test.tsx nav/sample invoice, pnpm workspace apps/*
provides:
  - Nest workspace package apps/backend with Jest test and test:e2e scripts
  - RED projectRbac unit spec and health/auth e2e specs
  - Skipped desktop auth gate/chip/banner specs plus signed-in MeResponse fixture
affects:
  - 02-02 tracer (turns backend RED specs green)
  - 02-04 UI (unskips phase02-auth desktop specs)

actuals:
  tokens: 3488
  tasks: 2
  commits: 3

tech-stack:
  added:
    - "@nestjs/core@11.2.1"
    - "@nestjs/platform-express@11.2.1"
    - "@nestjs/testing@11.2.1"
    - "ioredis@5.11.1"
    - "jest + ts-jest"
  patterns:
    - "Wave 0 RED public-seam specs before production auth"
    - "describe.skip('phase02-auth') + dynamic import specifiers so Vite collection stays green"

key-files:
  created:
    - apps/backend/package.json
    - apps/backend/src/auth/rbac.spec.ts
    - apps/backend/test/health.e2e-spec.ts
    - apps/backend/test/auth.e2e-spec.ts
    - apps/desktop/src/__tests__/auth-gate.test.tsx
    - apps/desktop/src/__tests__/session-chip.test.tsx
    - apps/desktop/src/__tests__/session-banner.test.tsx
    - apps/desktop/src/__tests__/auth-signed-in.ts
  modified:
    - pnpm-workspace.yaml
    - .npmrc
    - pnpm-lock.yaml

key-decisions:
  - "Wave 0 stays RED; projectRbac, /health, /auth implementation is 02-02"
  - "Desktop auth modules loaded via dynamic specifiers so missing files do not fail Vite import-analysis"
  - "prisma and @prisma/engines allowBuilds so pnpm --filter ./apps/backend install succeeds; scarf/unrs-resolver stay false"

patterns-established:
  - "Backend unit Jest: rootDir src, testRegex .spec.ts$; e2e via test/jest-e2e.json"
  - "rbac.spec.ts encodes D-25 catalog as literal arrays, not recomputed from production maps"
  - "phase02-auth skip string is the 02-04 unsip signal"

requirements-completed: [BACK-01, AUTH-01]

coverage:
  - id: D1
    description: Nest apps/backend package with scripts.test and scripts.test:e2e
    requirement: BACK-01
    verification:
      - kind: other
        ref: "node -e 'const p=require(\"./apps/backend/package.json\"); if(!p.scripts.test||!p.scripts[\"test:e2e\"]) process.exit(1)'"
        status: pass
    human_judgment: false
  - id: D2
    description: RED projectRbac unit spec (missing ./rbac until 02-02)
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "pnpm --filter ./apps/backend test -- rbac"
        status: pass
    human_judgment: false
  - id: D3
    description: RED health and auth e2e specs at /health, /me, /api/invoices, ticket TTL, logout
    requirement: BACK-01
    verification:
      - kind: other
        ref: "test -f apps/backend/test/health.e2e-spec.ts && test -f apps/backend/test/auth.e2e-spec.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: Skipped desktop gate/chip/banner specs; desktop suite stays green
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "pnpm --filter ./apps/desktop test"
        status: pass
    human_judgment: false
  - id: D5
    description: Phase 1 routes.test.tsx still expects five nav labels and RE-2026-001
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/routes.test.tsx"
        status: pass
    human_judgment: false

duration: 7min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 01: Nyquist Wave 0 Summary

**Nest 11.2.1 workspace package with Jest, RED `/health` `/me` `projectRbac` specs, and skipped desktop auth tests so Phase 1 Vitest stays green**

## Performance

- **Duration:** 7 min
- **Started:** 2026-08-22T01:14:04Z
- **Completed:** 2026-08-22T01:22:01Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Private `apps/backend` Nest Express package (`@nestjs/core` / `@nestjs/platform-express` 11.2.1, `ioredis` 5.11.1) with `test` and `test:e2e`
- Failing `projectRbac` unit spec (cannot resolve `./rbac`) plus health/auth e2e specs at the public HTTP seams
- `describe.skip('phase02-auth')` gate/chip/banner specs and `signedInOwner` MeResponse fixture; `pnpm --filter ./apps/desktop test` green
- GitHub CI still desktop-only — RED backend specs are not on CI this plan

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Nest workspace package and RED health/auth/rbac specs** - `8901833` (test)
2. **Task 2: Desktop RED auth specs plus signed-in fixture so Phase 1 routes stay green** - `30e3c6c` (test)

**Plan metadata:** `docs(02-01): complete Nyquist Wave 0 plan` (this commit)

_Note: TDD GREEN for backend is 02-02; GREEN for desktop auth UI is 02-04. Wave 0 is RED/skip by design._

## Files Created/Modified

- `apps/backend/package.json` - private `backend` package, pinned Nest/Prisma/ioredis, `test` / `test:e2e`
- `apps/backend/tsconfig.json` / `tsconfig.build.json` / `nest-cli.json` / `jest.config.cjs` - Nest + Jest
- `apps/backend/src/main.ts` / `src/app.module.ts` - compile-only scaffold, no `/health` or auth yet
- `apps/backend/src/auth/rbac.spec.ts` - D-22..D-25 catalog and precedence cases
- `apps/backend/test/health.e2e-spec.ts` - GET `/health` 200; GET `/health/ready` 200 or 503 with postgres
- `apps/backend/test/auth.e2e-spec.ts` - 401 `/me` and `/api/invoices`, ticket replay, TTL 60/86400, parallel GETDEL, this-device logout
- `apps/backend/test/jest-e2e.json` - e2e Jest config
- `apps/desktop/src/__tests__/auth-signed-in.ts` - MeResponse owner fixture
- `apps/desktop/src/__tests__/auth-gate.test.tsx` - skipped gate copy + no navigation
- `apps/desktop/src/__tests__/session-chip.test.tsx` - skipped German badge map + email fallback
- `apps/desktop/src/__tests__/session-banner.test.tsx` - skipped 401/cancel vs ErrorState copy
- `pnpm-workspace.yaml` / `.npmrc` - prisma engine postinstall allowlist
- `pnpm-lock.yaml` - backend workspace lock

## Decisions Made

- Kept Wave 0 production surface empty (empty `AppModule`) so health/auth stay RED until 02-02
- Used `["..","auth","login-gate"].join("/")` dynamic specifiers instead of static `import()` — Vite 8 import-analysis fails the whole desktop suite on missing files even inside `describe.skip`
- Allowed `prisma` / `@prisma/engines` build scripts; left `@scarf/scarf` and `unrs-resolver` denied
- Did not edit `routes.test.tsx` — App is still ungated, Phase 1 assertions already pass

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prisma postinstall blocked `pnpm --filter`**
- **Found during:** Task 1 (install)
- **Issue:** pnpm 11 `ERR_PNPM_IGNORED_BUILDS` for `prisma` / `@prisma/engines` aborted install, so `pnpm --filter ./apps/backend test` never reached Jest
- **Fix:** Set `allowBuilds` prisma/@prisma/engines true; scarf/unrs-resolver false. Extended `.npmrc` `onlyBuiltDependencies`
- **Files modified:** `pnpm-workspace.yaml`, `.npmrc`
- **Verification:** `pnpm install` exits 0; `pnpm --filter ./apps/backend test -- rbac` runs Jest and fails RED
- **Committed in:** `8901833` (Task 1)

**2. [Rule 3 - Blocking] Vite resolves skipped dynamic imports**
- **Found during:** Task 2 (desktop verify)
- **Issue:** Static and `@vite-ignore` `import("../auth/login-gate")` still fail `vite:import-analysis` during collection, so `describe.skip` never protected the suite
- **Fix:** Fully dynamic specifiers via `["..","auth",name].join("/")` so Vite does not pre-resolve missing modules
- **Files modified:** `apps/desktop/src/__tests__/auth-gate.test.tsx`, `session-chip.test.tsx`, `session-banner.test.tsx`
- **Verification:** `pnpm --filter ./apps/desktop test` exits 0 (20 passed, 13 skipped)
- **Committed in:** `30e3c6c` (Task 2)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Required for Wave 0 verify commands. No production auth/UI shipped. No scope creep.

## TDD Gate Compliance

Plan `type: execute` with per-task `tdd="true"`. RED commits exist (`test(02-01): …`). GREEN is intentionally deferred: backend implementation is 02-02, desktop LoginGate/chip/banners are 02-04. No `feat(02-01):` GREEN commit — by plan, not a missed gate.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| `apps/desktop/src/__tests__/auth-gate.test.tsx` | describe.skip | `phase02-auth` | 02-04 implements LoginGate |
| `apps/desktop/src/__tests__/session-chip.test.tsx` | describe.skip | `phase02-auth` | 02-04 implements SessionChip |
| `apps/desktop/src/__tests__/session-banner.test.tsx` | describe.skip | `phase02-auth` | 02-04 implements SessionBanner |
| `apps/desktop/src/__tests__/auth-signed-in.ts` | permissions `[]` | fixture catalog empty | 02-04 SessionProvider tests; not wired to UI this plan |

These do not block Wave 0: backend specs are RED, desktop suite is green, Phase 1 routes unchanged.

## Issues Encountered

- Prisma 7.9.1 preinstall warns this Node is outside 20.19+/22.12+/24.0+; RESEARCH assumed Node 26 is fine. No generate/migrate this plan — track for 02-02 if `prisma generate` fails on the executor Node.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 02-02 (health/auth/rbac tracer turns RED specs green)
- Do not add a backend CI job until those specs pass
- 02-04 must unsip `phase02-auth` and add `apps/desktop/src/auth/{login-gate,session-chip,session-banner}`

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*

## Self-Check: PASSED

- FOUND: apps/backend/package.json, rbac.spec.ts, health.e2e-spec.ts, auth.e2e-spec.ts
- FOUND: desktop auth-gate/session-chip/session-banner/auth-signed-in
- FOUND: 8901833, 30e3c6c
- FOUND: 02-01-SUMMARY.md
