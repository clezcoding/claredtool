---
phase: 02-self-hosted-backend-authentik-sso
plan: 07
subsystem: infra
tags: [nestjs, docker, coolify, openssl, dist/main.js, BACK-01, G-02-2, G-02-5]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: Nest health endpoints, Coolify Dockerfile pack, prisma migrate deploy CMD
provides:
  - nest emit dist/main.js via tsconfig.build include src
  - Coolify image openssl + curl; vendor HTTPS /health and /health/ready 200
affects:
  - Phase 02 UAT retest of vendor health (G-02-2, G-02-5)
  - BACK-01 Coolify API liveness

actuals:
  tokens: 360
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns:
    - "tsconfig.build include src so nest emits dist/main.js; Coolify Dockerfile pack needs curl/wget for HTTP healthcheck"

key-files:
  created: []
  modified:
    - apps/backend/tsconfig.build.json
    - apps/backend/nest-cli.json
    - apps/backend/Dockerfile
    - .planning/phases/02-self-hosted-backend-authentik-sso/02-USER-SETUP.md

key-decisions:
  - "Fix emit path to dist/main.js; do not paper over with a nested CMD (G-02-2)"
  - "apt-get install curl so Coolify Dockerfile HTTP healthcheck can probe /health (node:22-bookworm-slim has neither curl nor wget)"
  - "Local Authentik GHCR 2026.8.0 denial stays environmental; compose.yml unchanged (G-02-5)"

patterns-established:
  - "Coolify Dockerfile pack + node slim image: install curl (or wget) or Coolify rolls back a healthy Nest process"

requirements-completed: [BACK-01]

coverage:
  - id: D1
    description: nest build emits apps/backend/dist/main.js; prisma.config.ts not in outDir
    requirement: BACK-01
    verification:
      - kind: other
        ref: "pnpm --filter ./apps/backend build && test -f apps/backend/dist/main.js"
        status: pass
    human_judgment: false
  - id: D2
    description: Dockerfile installs openssl, asserts dist/main.js after nest build, CMD stays prisma migrate deploy && node dist/main.js
    requirement: BACK-01
    verification:
      - kind: other
        ref: "docker build -f apps/backend/Dockerfile; test -f /app/apps/backend/dist/main.js; openssl version"
        status: pass
    human_judgment: false
  - id: D3
    description: Coolify clared-api yzmje7zsrp1qwtvsd7izjhaf finished healthy; GET https://clared-api.puzzlessdev.online/health 200
    requirement: BACK-01
    verification:
      - kind: other
        ref: "curl -sfS https://clared-api.puzzlessdev.online/health → 200 {\"status\":\"ok\"}"
        status: pass
    human_judgment: false
  - id: D4
    description: GET https://clared-api.puzzlessdev.online/health/ready 200 against Coolify Postgres
    requirement: BACK-01
    verification:
      - kind: other
        ref: "curl -sfS https://clared-api.puzzlessdev.online/health/ready → 200 postgres up"
        status: pass
    human_judgment: false
  - id: D5
    description: Coolify env list for clared-api has no AUTH_TEST_MODE; build pack stays dockerfile
    requirement: BACK-01
    verification:
      - kind: other
        ref: "Coolify env_vars list (no reveal); get_application build_pack=dockerfile dockerfile_location=/apps/backend/Dockerfile"
        status: pass
    human_judgment: false
  - id: D6
    description: Human vendor-health UAT (Coolify Dockerfile pack unchanged; laptop GHCR Authentik optional)
    requirement: BACK-01
    verification: []
    human_judgment: true
    rationale: "Plan human-check of vendor dashboard pack and local GHCR Authentik is harvested into phase UAT; automated curls already pass"

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 07: nest emit dist/main.js + Coolify redeploy Summary

**Coolify Nest image emits `dist/main.js`, installs openssl+curl, and serves vendor HTTPS `/health` and `/health/ready` 200**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T04:17:26Z
- **Completed:** 2026-08-22T04:29:12Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `tsconfig.build.json` include `src` so nest emits `dist/main.js` (not `dist/src/main.js` from `prisma.config.ts` widening rootDir)
- `nest-cli.json` `compilerOptions.tsConfigPath` points at `tsconfig.build.json`
- Dockerfile installs openssl/ca-certificates/curl, asserts `dist/main.js` after nest build, CMD stays `prisma migrate deploy && node dist/main.js`
- Coolify `clared-api` (`yzmje7zsrp1qwtvsd7izjhaf`) deployment `peikgsaq4fsuhtofadx3olm3` finished healthy on commit `bacf429`
- Vendor `https://clared-api.puzzlessdev.online/health` and `/health/ready` both HTTP 200

## Task Commits

Each task was committed atomically:

1. **Task 1: nest emit dist/main.js + openssl in the Coolify Dockerfile** - `7834aaf` (fix)
2. **Task 2: Redeploy Coolify clared-api** - `bacf429` (fix: curl for Coolify HTTP healthcheck; deploy finished)

**Plan metadata:** pending `docs(02-07)` commit

_Note: Task 2 also pushed `gsd/phase-02-self-hosted-backend-authentik-sso` (the branch Coolify already tracks) and MCP-deployed uuid `yzmje7zsrp1qwtvsd7izjhaf`._

## Files Created/Modified

- `apps/backend/tsconfig.build.json` - include `src` only
- `apps/backend/nest-cli.json` - `tsConfigPath` `tsconfig.build.json`
- `apps/backend/Dockerfile` - openssl + curl via apt; `test -f dist/main.js` after nest build
- `.planning/phases/02-self-hosted-backend-authentik-sso/02-USER-SETUP.md` - Coolify Dockerfile pack notes + vendor health curls

## Decisions Made

- Fix emit to `dist/main.js`; do not change CMD to `dist/src/main.js` (G-02-2 flagged assumption)
- Add `curl` to the same apt-get as openssl so Coolify Dockerfile healthcheck can probe `/health` (first deploy started Nest then rolled back: `curl: not found`)
- Leave `compose.yml` Authentik tag `2026.8.0` unchanged (G-02-5 environmental GHCR denial on the laptop)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Coolify HTTP healthcheck needs curl in the slim image**
- **Found during:** Task 2 (first Coolify deploy of `7834aaf`, uuid `lhsjf2tlzmaogmqpgye1uitz`)
- **Issue:** Nest started from `dist/main.js` and mapped `/health`; Coolify probe used curl/wget which `node:22-bookworm-slim` lacks; container marked unhealthy and rolled back
- **Fix:** apt-get install `curl` alongside openssl/ca-certificates
- **Files modified:** `apps/backend/Dockerfile`
- **Verification:** Deploy `peikgsaq4fsuhtofadx3olm3` status `finished`, healthcheck `healthy`; vendor curls 200
- **Committed in:** `bacf429` (Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for Coolify to keep the new container; no Nixpacks switch, no AUTH_TEST_MODE, no compose.yml change

## Issues Encountered

- MCP `deploy` with `wait:true` timed out at the client (~60s) while the build was still running. Polled `deployment get` instead. First deploy failed on healthcheck (curl missing). Second deploy (force, commit `bacf429`) finished.

## Authentication Gates

None.

## User Setup Required

See [02-USER-SETUP.md](./02-USER-SETUP.md). Coolify Dockerfile pack for `clared-api` is done (checked off). Remaining items are local Authentik blueprint / env.

## Next Phase Readiness

- G-02-2 and G-02-5 closed for the vendor API. Local GHCR Authentik pull on the laptop remains environmental.
- Phase 02 plans 01–07 all have SUMMARYs after this file. Ready for `/gsd-verify-work 02`.

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*

## Self-Check: PASSED
