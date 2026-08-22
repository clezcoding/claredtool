---
phase: 02-self-hosted-backend-authentik-sso
plan: 02
subsystem: auth
tags: [nestjs, prisma7, redis, oidc, rbac, terminus, swagger, ioredis]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: Nest workspace package, RED health/auth/rbac specs, skipped desktop auth tests
provides:
  - Green GET /health and GET /health/ready (Terminus Prisma ping)
  - Opaque Redis Bearer via one-time ticket GETDEL and GET /me
  - projectRbac D-25 catalog with primaryRole precedence
  - Prisma 7 empty init migration deployed locally
  - Coolify Dockerfile with prisma migrate deploy CMD
  - Desktop typed fetch client (redeemTicket, fetchMe, logoutSession, apiFetch)
affects:
  - 02-03 Tauri login window / keychain (consumes /auth/login and Bearer)
  - 02-04 LoginGate / SessionChip (consumes /me shape)
  - 02-05 live Authentik (fills oidc.ts discovery)

actuals:
  tokens: 8102
  tasks: 3
  commits: 5

tech-stack:
  added:
    - "Prisma 7 prisma-client + PrismaPg adapter"
    - "@nestjs/terminus PrismaHealthIndicator"
    - "@nestjs/swagger /api/docs + openapi.json"
    - "helmet + ValidationPipe + CORS_ORIGINS"
  patterns:
    - "Global AuthGuard + @Public() + non-public catch-all 401"
    - "MemoryStore in NODE_ENV=test; ioredis when REDIS_URL set"
    - "Ticket GETDEL then session:{token} EX 86400"

key-files:
  created:
    - apps/backend/src/health/health.controller.ts
    - apps/backend/src/auth/auth.controller.ts
    - apps/backend/src/auth/auth.guard.ts
    - apps/backend/src/auth/rbac.ts
    - apps/backend/src/me/me.controller.ts
    - apps/backend/prisma/schema.prisma
    - apps/backend/Dockerfile
    - compose.clared.yml
    - apps/desktop/src/auth/api.ts
    - apps/desktop/src/auth/types.ts
    - apps/backend/prisma/migrations/20260822014200_init/migration.sql
  modified:
    - apps/backend/src/main.ts
    - apps/backend/src/app.module.ts
    - apps/backend/test/health.e2e-spec.ts
    - apps/backend/test/auth.e2e-spec.ts
    - .github/workflows/ci.yml
    - .gitignore

key-decisions:
  - "MemoryStore lives at apps/backend/src/auth/memory-store.ts because 02-01 e2e imports that path"
  - "POST /auth/session uses @HttpCode(200); Nest POST default 201 would fail AUTH-01"
  - "Empty Prisma init migration (comment-only SQL) because schema has no models (D-22)"
  - "SCHEMA_PUSH targeted compose.clared.yml Postgres explicitly; host :5432 was a different instance"

patterns-established:
  - "e2e uses MemoryStore + listen(0) so parallel GETDEL is one 200 and one 401"
  - "Dockerfile build context is repo root; prisma generate before nest build; CMD migrate && node"
  - "Desktop api.ts uses VITE_BACKEND_URL ?? http://localhost:3000; no token in localStorage"

requirements-completed: [BACK-01, AUTH-01]

coverage:
  - id: D1
    description: GET /health 200 without Prisma I/O; GET /health/ready Terminus postgres ping
    requirement: BACK-01
    verification:
      - kind: e2e
        ref: "apps/backend/test/health.e2e-spec.ts#Health (e2e)"
        status: pass
    human_judgment: false
  - id: D2
    description: Unauthenticated GET /me and GET /api/invoices return 401; one-time ticket GETDEL; logout this device only
    requirement: AUTH-01
    verification:
      - kind: e2e
        ref: "apps/backend/test/auth.e2e-spec.ts#Auth (e2e)"
        status: pass
    human_judgment: false
  - id: D3
    description: projectRbac unions D-25 catalog and sets primaryRole by D-23 precedence
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/backend/src/auth/rbac.spec.ts#projectRbac"
        status: pass
    human_judgment: false
  - id: D4
    description: Prisma init migration applied; GET /health/ready 200 against compose Postgres
    requirement: BACK-01
    verification:
      - kind: other
        ref: "npx prisma migrate deploy && curl GET /health/ready"
        status: pass
    human_judgment: false
  - id: D5
    description: Desktop typed fetch client compiles (redeemTicket, fetchMe)
    requirement: BACK-01
    verification:
      - kind: other
        ref: "pnpm --filter ./apps/desktop exec tsc --noEmit"
        status: pass
    human_judgment: false

duration: 19min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 02: Ticket Redeem Tracer Summary

**Nest Express tracer: one-time Redis ticket GETDEL mints an opaque 24h Bearer, GET /me returns D-32 fields, Terminus pings Postgres, Prisma 7 empty init migration deploys, desktop `api.ts` compiles**

## Performance

- **Duration:** 19 min
- **Started:** 2026-08-22T01:26:21Z
- **Completed:** 2026-08-22T01:45:23Z
- **Tasks:** 3
- **Files modified:** 31

## Accomplishments

- Green health and auth e2e: `/health` 200, `/health/ready` postgres 200/503, unauthenticated `/me` and `/api/invoices` 401, parallel ticket GETDEL, this-device logout
- `projectRbac` D-25 catalog with platform copying all tenant rights plus four `platform.*` keys; empty groups yield `permissions []` and `primaryRole ""`
- Prisma 7 `prisma-client` schema (no User/Role), init migration deployed, Dockerfile `CMD prisma migrate deploy && node dist/main.js`
- Desktop `redeemTicket` / `fetchMe` / `logoutSession` / `apiFetch`; CI runs backend `test:e2e` and `test -- rbac`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end ticket redeem → Bearer → /me** - `e8f733f` (feat)
2. **Task 2: Full RBAC catalog union and primaryRole precedence** - `26d1201` (feat), `2466087` (fix)
3. **Task 3: Prisma schema push after all schema edits** - `23ab9d8` (feat)

**Plan metadata:** `docs(02-02): complete ticket redeem tracer plan` (this commit)

## Files Created/Modified

- `apps/backend/src/health/health.controller.ts` - `/health` 200 no DB; `/health/ready` Terminus Prisma ping
- `apps/backend/src/auth/auth.controller.ts` - login/callback stubs, POST `/auth/session` GETDEL, logout DEL this key
- `apps/backend/src/auth/auth.guard.ts` - Bearer → `session:{token}` Redis lookup
- `apps/backend/src/auth/rbac.ts` - pure `projectRbac`
- `apps/backend/src/me/me.controller.ts` - D-32 JSON keys only
- `apps/backend/src/prisma/prisma.service.ts` - Prisma 7 + PrismaPg
- `apps/backend/src/redis/redis.service.ts` - ioredis / MemoryStore
- `apps/backend/prisma/schema.prisma` - postgresql + prisma-client, no models
- `apps/backend/prisma/migrations/20260822014200_init/` - empty init SQL
- `apps/backend/Dockerfile` - repo-root context, generate, build, migrate CMD
- `compose.clared.yml` - Postgres 16 + Redis 7
- `apps/desktop/src/auth/api.ts` / `types.ts` - typed fetch + MeResponse
- `.github/workflows/ci.yml` - backend e2e + rbac

## Decisions Made

- Placed `MemoryStore` at `src/auth/memory-store.ts` to match Wave 0 e2e imports; redis/ re-exports the same class
- Forced `@HttpCode(200)` on POST `/auth/session` and `/auth/logout` (Nest POST defaults to 201)
- Created a comment-only init migration after `migrate dev` reported already in sync on an empty schema
- SCHEMA_PUSH used compose Postgres explicitly because host `:5432` was a different Postgres instance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Nest POST returned 201**
- **Found during:** Task 1 (auth e2e)
- **Issue:** Logout/session tests expected 200; Nest `@Post()` defaults to 201
- **Fix:** `@HttpCode(HttpStatus.OK)` on session and logout
- **Files modified:** `apps/backend/src/auth/auth.controller.ts`
- **Verification:** auth e2e 6/6 pass
- **Committed in:** `e8f733f`

**2. [Rule 1 - Bug] Parallel redeem ECONNRESET without listen()**
- **Found during:** Task 1 (auth e2e)
- **Issue:** `app.init()` without bind dropped one of two concurrent POSTs
- **Fix:** `await app.listen(0)` in health/auth e2e
- **Files modified:** `apps/backend/test/auth.e2e-spec.ts`, `apps/backend/test/health.e2e-spec.ts`
- **Verification:** parallel GETDEL yields `[200, 401]`
- **Committed in:** `e8f733f`

**3. [Rule 2 - Missing Critical] e2e tickets were never seeded**
- **Found during:** Task 1
- **Issue:** Wave 0 specs POST known ticket ids without inserting keys
- **Fix:** `beforeAll` SET NX claims for replay/parallel/logout tickets
- **Files modified:** `apps/backend/test/auth.e2e-spec.ts`
- **Verification:** replay 401, parallel 200+401, logout this-device only
- **Committed in:** `e8f733f`

**4. [Rule 3 - Blocking] Host :5432 is not compose Postgres**
- **Found during:** Task 3
- **Issue:** `127.0.0.1:5432` answered a different Postgres (`clared_app` missing). Executor shell also had a non-local `DATABASE_URL`
- **Fix:** `prisma migrate deploy` and ready check used compose container IP; `.env.example` still documents `127.0.0.1:5432`
- **Files modified:** none in-repo besides the init migration
- **Verification:** migrate deploy 0; `GET /health/ready` 200 `postgres.up`
- **Committed in:** `23ab9d8`

**5. [Rule 1 - Bug] CATALOG keys omitted `clared-` prefix**
- **Found during:** Task 2 acceptance grep
- **Issue:** D-24 group names were suffixes only
- **Fix:** Catalog keyed by `clared-platform` … `clared-viewer`
- **Files modified:** `apps/backend/src/auth/rbac.ts`
- **Verification:** `pnpm --filter ./apps/backend test -- rbac` 8/8
- **Committed in:** `2466087`

---

**Total deviations:** 5 auto-fixed (3 bug, 1 missing critical, 1 blocking)
**Impact on plan:** Required for GREEN e2e, SCHEMA_PUSH, and D-24 name acceptance. No extra HTTP handlers. No production SECRET in desktop.

## TDD Gate Compliance

Plan `type: execute` with per-task `tdd="true"`. RED commits live on 02-01 (`test(02-01): …`). This plan is GREEN: `feat(02-02):` tracer, RBAC, migration. No new RED commit — Wave 0 already wrote the failing specs.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| `apps/backend/src/auth/oidc.ts` | 20, 52 | `AUTH_TEST_MODE=1` skips live discovery | 02-05 fills openid-client against Authentik |
| `apps/backend/src/auth/auth.controller.ts` | 144 | `endSessionUrl` path string | 02-05 uses real Authentik end-session |
| `apps/desktop/src/auth/api.ts` | 11 | `setOnUnauthorized` callback | 02-04 wires 401 retry + login window |

These do not block BACK-01/AUTH-01 tracer: e2e uses MemoryStore + seeded tickets; live OIDC is 02-05.

## Threat Flags

None — `/health`, `/auth/*`, `/me`, Redis tickets/sessions, and Prisma ping match the plan `<threat_model>`.

## Issues Encountered

- Prisma 7 empty schema: `migrate dev --name init` reported already in sync. Created comment-only `20260822014200_init` via `migrate diff --from-empty` then `migrate deploy`
- Jest e2e `forceExit` because pg pool handles stay open after Terminus timeout when Postgres is down
- `import * as request from "supertest"` failed ts-jest; switched to default import

## User Setup Required

**External services require manual configuration.** See [02-USER-SETUP.md](./02-USER-SETUP.md) for:
- OrbStack running (`docker compose -f compose.clared.yml up -d`)
- Copy `apps/backend/.env.example` → `.env` (local SECRET only)
- `npx prisma migrate deploy` against that Postgres

## Next Phase Readiness

- Ready for 02-03 (Tauri login window, `clared://`, OS keychain)
- Do not treat oidc.ts as live Authentik — 02-05
- CI now runs backend e2e; compose Postgres is not a CI service (ready may 503 there, which e2e allows)

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*

## Self-Check: PASSED

- FOUND: health.controller, auth.controller, auth.guard, rbac, me.controller, schema.prisma, Dockerfile, compose.clared.yml, api.ts, types.ts, init migration, 02-02-SUMMARY.md
- FOUND: e8f733f, 26d1201, 2466087, 23ab9d8
- FOUND: 02-USER-SETUP.md
