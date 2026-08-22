---
phase: 02-self-hosted-backend-authentik-sso
plan: 05
subsystem: auth
tags: [openid-client, authentik, oidc, pkce, compose, blueprint]

requires:
  - phase: 02-self-hosted-backend-authentik-sso
    provides: OIDC stub, Redis ticket/session, RBAC catalog, desktop LoginGate
provides:
  - Real panva openid-client 6 confidential code flow against issuer …/application/o/clared/
  - PKCE S256 + state; scopes openid profile email groups; userinfo groups fallback
  - Logout endSessionUrl …/application/o/clared/end-session/
  - Vendor compose.yml (Authentik 2026.8.0, unforked)
  - blueprints/clared.yaml (app clared, eight D-24 groups, groups scope mapping)
affects:
  - Phase 3 entity/invoice enforcement of /me groups
  - Founder Coolify Authentik + Nest deploy (human)

actuals:
  tokens: 3847
  tasks: 3
  commits: 5

tech-stack:
  added:
    - "Authentik vendor compose.yml tag 2026.8.0 (wget, not forked)"
    - "Authentik blueprint v1 blueprints/clared.yaml"
  patterns:
    - "Dynamic import('openid-client') so Jest CJS never parses the ESM package in AUTH_TEST_MODE"
    - "pickGroups(id token, userinfo) — ID token first, userinfo if groups missing"
    - "Two compose files: vendor Authentik compose.yml + compose.clared.yml (Postgres+Redis)"

key-files:
  created:
    - apps/backend/src/auth/oidc.spec.ts
    - compose.yml
    - blueprints/clared.yaml
  modified:
    - apps/backend/src/auth/oidc.ts
    - apps/backend/src/auth/auth.controller.ts
    - apps/backend/test/auth.e2e-spec.ts
    - apps/backend/.env.example
    - .planning/phases/02-self-hosted-backend-authentik-sso/02-USER-SETUP.md

key-decisions:
  - "Keep dynamic import of openid-client; static ESM import breaks Jest CJS (AUTH_TEST_MODE never loads the package)"
  - "Blueprint sets client_id clared and does not set client_secret (copy generated SECRET into env; prod only in Coolify)"
  - "wget official compose.yml verbatim — postgresql service is Authentik's DB, no redis, no /etc/localtime"

patterns-established:
  - "beginAuthorization owns PKCE verifier/challenge + state; controller only stores oauth:{state} and redirects"
  - "AUTH_TEST_MODE=1 short-circuits discovery so e2e stays offline"
  - "Same blueprint local and prod; instance context backend_callback overrides the redirect URI"

requirements-completed: [BACK-01, AUTH-01]

coverage:
  - id: D1
    description: openid-client discovery + ClientSecretPost + PKCE S256 + groups scope; pickGroups ID token then userinfo
    requirement: AUTH-01
    verification:
      - kind: unit
        ref: "apps/backend/src/auth/oidc.spec.ts#pickGroups; OIDC_SCOPES"
        status: pass
    human_judgment: false
  - id: D2
    description: Callback 302 clared://auth?ticket= and logout endSessionUrl …/application/o/clared/end-session/
    requirement: AUTH-01
    verification:
      - kind: e2e
        ref: "apps/backend/test/auth.e2e-spec.ts#GET /auth/callback; POST /auth/logout"
        status: pass
    human_judgment: false
  - id: D3
    description: Vendor compose.yml ghcr.io/goauthentik/server:2026.8.0, no redis service, no /etc/localtime
    requirement: BACK-01
    verification:
      - kind: other
        ref: "test -f compose.yml && grep ghcr.io/goauthentik/server && grep -c localtime = 0"
        status: pass
    human_judgment: false
  - id: D4
    description: Blueprint app clared, eight D-24 groups, OpenID groups scope mapping
    requirement: AUTH-01
    verification:
      - kind: other
        ref: "blueprints/clared.yaml grep clared-platform/owner/viewer and groups"
        status: pass
    human_judgment: false
  - id: D5
    description: Live Authentik MFA login in the Tauri WebView and Coolify founder-cluster deploy
    requirement: AUTH-01
    verification: []
    human_judgment: true
    rationale: "Live IdP, MFA, blueprint apply, and Coolify env are user_setup; mocked e2e cannot exercise them"

duration: 7min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 05: Authentik OIDC + Vendor Compose Summary

**Confidential panva openid-client 6 code flow against Authentik `…/application/o/clared/`, vendor compose.yml 2026.8.0, and an in-repo blueprint for app `clared` plus eight groups**

## Performance

- **Duration:** 7 min
- **Started:** 2026-08-22T02:20:01Z
- **Completed:** 2026-08-22T02:27:15Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Replaced the 02-02 OIDC stub with `discovery` + `ClientSecretPost` + PKCE S256 + `authorizationCodeGrant`; scopes `openid profile email groups`
- `pickGroups` reads ID-token `groups`, then Authentik userinfo if the claim is missing
- `POST /auth/logout` returns `endSessionUrl` `…/application/o/clared/end-session/`
- Vendored official Authentik `compose.yml` (tag `2026.8.0`, no fork, no Redis, no `/etc/localtime`)
- Added `blueprints/clared.yaml`: confidential app `clared`, eight D-24 groups, dedicated `groups` scope mapping
- Mocked e2e still green via `AUTH_TEST_MODE=1`

## Task Commits

Each task was committed atomically:

1. **Task 1: Real openid-client confidential code flow + groups claim** - `2c91570` (test) then `5305ae3` (feat)
2. **Task 2: Vendor Authentik compose.yml + Clared blueprint** - `e7153a1` (feat)
3. **Task 3: e2e green + local up command in .env.example** - `c1c406e` (docs)

**Plan metadata:** (this commit)

_Note: Task 1 was `tdd="true"` — RED test commit then GREEN feat commit._

## Files Created/Modified

- `apps/backend/src/auth/oidc.ts` - live openid-client path, `pickGroups`, `beginAuthorization`, `endSessionUrl`
- `apps/backend/src/auth/oidc.spec.ts` - groups claim + `OIDC_SCOPES` unit tests
- `apps/backend/src/auth/auth.controller.ts` - PKCE via `beginAuthorization`; logout uses `endSessionUrl()`
- `apps/backend/test/auth.e2e-spec.ts` - callback `clared://` + logout `endSessionUrl` assertions
- `compose.yml` - official Authentik compose (wget)
- `blueprints/clared.yaml` - app `clared`, eight groups, groups mapping
- `apps/backend/.env.example` - two-file compose up + Coolify SECRET warning
- `.planning/phases/02-self-hosted-backend-authentik-sso/02-USER-SETUP.md` - Authentik apply + Coolify env

## Decisions Made

- Dynamic `import("openid-client")` only on the live path. Static ESM import crashes Jest CJS; `AUTH_TEST_MODE=1` never loads the package.
- Blueprint `client_id: clared`, no `client_secret` in YAML — generated secret is copied to env; production SECRET never on the laptop.
- Official `compose.yml` left verbatim. Authentik Postgres is the vendor `postgresql` service; Clared DB stays in `compose.clared.yml`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Keep dynamic import of openid-client**
- **Found during:** Task 1 (GREEN)
- **Issue:** Static `import * as client from "openid-client"` made Jest fail parsing ESM `oauth4webapi` (`Cannot use import statement outside a module`).
- **Fix:** Restore dynamic `await import("openid-client")` behind the `AUTH_TEST_MODE` short-circuit (same seam as 02-02). Acceptance still holds: oidc.ts imports and calls `discovery` / `authorizationCodeGrant`.
- **Files modified:** `apps/backend/src/auth/oidc.ts`
- **Verification:** `pnpm --filter ./apps/backend test -- oidc` and `test:e2e -- auth` exit 0
- **Committed in:** `5305ae3` (Task 1 feat)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for mocked tests to stay offline. Live path still uses panva 6 discovery + PKCE + grant + userinfo. No scope creep.

## Issues Encountered

- Health e2e still logs a Terminus postgres timeout when `/health/ready` is down — pre-existing, suite still passes. Not fixed here.

## User Setup Required

**External services require manual configuration.** See [02-USER-SETUP.md](./02-USER-SETUP.md) for:
- Apply `blueprints/clared.yaml` in Authentik admin
- Copy local CLIENT_ID / SECRET into `apps/backend/.env` (never prod SECRET)
- Coolify env + pin Authentik image tag `2026.8.0`

## Next Phase Readiness

Phase 2 plans complete. Live Authentik login and Coolify deploy remain human checks (02-VALIDATION). Ready for `/gsd-verify-work 02` then Phase 3 discuss/plan.

## Self-Check: PASSED

---
*Phase: 02-self-hosted-backend-authentik-sso*
*Completed: 2026-08-22*
